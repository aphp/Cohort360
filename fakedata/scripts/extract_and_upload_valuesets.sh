#!/bin/bash

CURDIR=$(dirname "$(readlink -f "$0")")


# Script to extract valuesets from FHIR resources, generate a markdown table,
# and upload the valuesets to the FHIR instance
FHIR_HOST=http://fhir:8080

# Create a temporary directory for valuesets
TEMP_DIR=$(mktemp -d -t valuesets-XXXXXXXXXX)
echo "Created temporary directory: $TEMP_DIR"

# Path to the fakedata-output/fhir directory
FHIR_DIR=$1

# Path for the markdown file
MARKDOWN_FILE=$2

echo "Extracting valuesets from FHIR resources in $FHIR_DIR"
echo "Valuesets will be stored in $TEMP_DIR"
echo "Markdown table will be generated at $MARKDOWN_FILE"

# Run the extract_valuesets.py script
python3 $CURDIR/extract_valuesets.py \
  --input-dir "$FHIR_DIR" \
  --output-dir "$TEMP_DIR" \
  --markdown-file "$MARKDOWN_FILE"

# Check if the script executed successfully
if [ $? -ne 0 ]; then
  echo "Error: Failed to extract valuesets"
  exit 1
fi

echo "Valuesets extracted successfully"

# Upload the valuesets to the FHIR instance
echo "Uploading valuesets to FHIR instance"

# Count total files for progress tracking
total_files=$(ls -1 "$TEMP_DIR"/*.json 2>/dev/null | wc -l)
if [ "$total_files" -eq 0 ]; then
  echo "No valuesets found to upload"
  exit 0
fi

current_file=0


# First upload all CodeSystems
for file in "$TEMP_DIR"/*-codesystem.json; do
  current_file=$((current_file + 1))
  filename=$(basename "$file")
  
  echo "[$current_file/$total_files] Uploading $filename"
  curl -X POST -H "Content-Type: application/json" $FHIR_HOST/fhir/CodeSystem -d @"$file"
  sleep 0.1
done

# Then upload all ValueSets
for file in "$TEMP_DIR"/*-valueset.json; do
  current_file=$((current_file + 1))
  filename=$(basename "$file")
  
  echo "[$current_file/$total_files] Uploading $filename"
  curl -X POST -H "Content-Type: application/json" $FHIR_HOST/fhir/ValueSet -d @"$file"
  sleep 0.1
done

echo "All valuesets uploaded successfully"
echo "Markdown table generated at $MARKDOWN_FILE"

# Clean up
echo "Cleaning up temporary directory"
rm -rf "$TEMP_DIR"

echo "Done!"
