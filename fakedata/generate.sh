#!/bin/bash

set -e

## Create status directory if it doesn't exist
mkdir -p /app/status

# Initialize status JSON file
cat > /app/status/status.json << EOF
{
  "percentComplete": 0,
  "currentStatus": "Starting initialization...",
  "timeRemaining": "Calculating...",
  "tasks": [
    {"id": 1, "name": "Generating fake data", "status": "in-progress"},
    {"id": 2, "name": "Loading hospitals data", "status": "pending"},
    {"id": 3, "name": "Loading practitioners data", "status": "pending"},
    {"id": 4, "name": "Loading patients data", "status": "pending"},
    {"id": 5, "name": "Synchronizing perimeters", "status": "pending"}
  ]
}
EOF

# Initialize timing metrics file 
cat > /app/status/timing_metrics.json << EOF
{
  "start_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "steps": []
EOF

update_status() {
  local percent=$1
  local status=$2
  local time_remaining=$3
  local current_task=$4
  
  # Update the task statuses
  local task_statuses=""
  for i in {1..6}; do
    if [ $i -lt $current_task ]; then
      task_status='"status": "completed"'
    elif [ $i -eq $current_task ]; then
      task_status='"status": "in-progress"'
    else
      task_status='"status": "pending"'
    fi
    
    if [ $i -eq 1 ]; then
      task_statuses="    {\"id\": $i, \"name\": \"Generating fake data\", $task_status}"
    elif [ $i -eq 2 ]; then
      task_statuses="$task_statuses,\n    {\"id\": $i, \"name\": \"Loading fhir data referentials\", $task_status}"
    elif [ $i -eq 3 ]; then
      task_statuses="$task_statuses,\n    {\"id\": $i, \"name\": \"Loading hospitals data\", $task_status}"
    elif [ $i -eq 4 ]; then
      task_statuses="$task_statuses,\n    {\"id\": $i, \"name\": \"Loading practitioners data\", $task_status}"
    elif [ $i -eq 5 ]; then
      task_statuses="$task_statuses,\n    {\"id\": $i, \"name\": \"Loading patients data\", $task_status}"
    elif [ $i -eq 6 ]; then
      task_statuses="$task_statuses,\n    {\"id\": $i, \"name\": \"Synchronizing perimeters\", $task_status}"
    fi
  done
  
  # Write updated status to file
  cat > /app/status/status.json << EOF
{
  "percentComplete": $percent,
  "currentStatus": "$status",
  "timeRemaining": "$time_remaining",
  "tasks": [
$(echo -e $task_statuses)
  ]
}
EOF

  echo "Status updated: $status ($percent%)"
}



# Function to record timing for a step
record_timing() {
  local step_name=$1
  local start_time=$2
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  
  # Convert duration to human-readable format
  local duration_human="$((duration / 60))m $((duration % 60))s"
  
  echo "Step '$step_name' completed in $duration_human"
  
  # Append to timing_metrics.json
  # We need to handle the JSON structure properly - if it's the first entry, no comma is needed
  local file_size=$(wc -c < /app/status/timing_metrics.json)
  local is_first_entry=$(grep -c "\"steps\": \[\]" /app/status/timing_metrics.json)
  
  # Create a temporary file to hold new step data
  cat > /tmp/new_step.json << EOF
    {
      "name": "$step_name",
      "start_time": "$(date -u -d @$start_time +"%Y-%m-%dT%H:%M:%SZ")",
      "end_time": "$(date -u -d @$end_time +"%Y-%m-%dT%H:%M:%SZ")",
      "duration_seconds": $duration,
      "duration_human": "$duration_human"
    }
EOF

  # If it's the first entry, replace the empty array
  if [ $is_first_entry -eq 1 ]; then
    sed -i 's/"steps": \[\]/"steps": \[/' /app/status/timing_metrics.json
    cat /tmp/new_step.json >> /app/status/timing_metrics.json
    echo "  ]" >> /app/status/timing_metrics.json
  else
    # Otherwise, insert before the closing bracket with a comma
    sed -i 's/  \]$/,/' /app/status/timing_metrics.json
    cat /tmp/new_step.json >> /app/status/timing_metrics.json
    echo "  ]" >> /app/status/timing_metrics.json
  fi
  
  # Clean up
  rm /tmp/new_step.json
}


# Start task 1: Generating fake data
task1_start=$(date +%s)
update_status 0 "Generating fake data" "20 minutes" 1
echo "Generating fake data"
java -jar synthea/synthea-shadow/lib/synthea-with-dependencies.jar -c synthea.properties Île-de-france
record_timing "Generating fake data" $task1_start
update_status 10 "Fake data generated successfully" "8 minutes" 2



pushd fhir_definition
task21_start=$(date +%s)
echo "Loading referentials"
update_status 11 "Loading fhir referentials" "19 minutes" 2
curl -XPOST -H 'Content-type: application/json' http://fhir:8080/fhir -d @valuesets.transaction.json
popd
./scripts/extract_and_upload_valuesets.sh output/fhir output/valuesets.md
record_timing "Loading fhir referentials" $task21_start
update_status 12 "Referentials data loaded" "18 minutes" 3


cd output/fhir

# Start task 2: Loading hospitals data
echo "Loading fake data"
task2_start=$(date +%s)
echo "Loading hospitals"
update_status 12 "Loading hospitals data" "18 minutes" 3
ls | grep hospitalInformation | xargs -I{} curl -XPOST -H 'Content-type: application/json' http://fhir:8080/fhir -d @{}
record_timing "Loading hospitals data" $task2_start
update_status 13 "Hospitals data loaded" "17 minutes" 4

# Start task 3: Loading practitioners data
task3_start=$(date +%s)
echo "Loading practitioners"
update_status 13 "Loading practitioners data" "17 minutes" 4
ls | grep practitioner | xargs -I{} curl -XPOST -H 'Content-type: application/json' http://fhir:8080/fhir -d @{}
record_timing "Loading practitioners data" $task3_start
update_status 14 "Practitioners data loaded" "16 minutes" 5

# Start task 4: Loading patients data
task4_start=$(date +%s)
echo "Loading patients data"
update_status 15 "Loading patients data" "16 minutes" 5

# Get total number of files for progress calculation
total_files=$(ls -1 | wc -l)
current_file=0
subtask_times_start=$(date +%s)

for file in *; do
  current_file=$((current_file + 1))
  
  # Calculate progress percentage for this subtask (between 65% and 85%)
  subtask_percent=$(( 15 + (current_file * 20) / total_files ))
  
# Update status every 10 files to avoid too many updates
  if (( current_file % 10 == 0 )); then
    # Calculate estimated time based on current rate
    current_time=$(date +%s)
    elapsed_time=$((current_time - subtask_times_start))
    
    # Handle division by zero and properly compare decimal values
    if [ $elapsed_time -gt 0 ]; then
      files_per_second=$(echo "scale=2; $current_file / $elapsed_time" | bc)
      # Use bc for floating point comparison
      is_positive=$(echo "$files_per_second > 0" | bc)
      
      if [ "$is_positive" -eq 1 ]; then
        remaining_files=$((total_files - current_file))
        estimated_seconds=$(echo "scale=0; $remaining_files / $files_per_second" | bc)
        estimated_minutes=$(echo "scale=0; $estimated_seconds / 60" | bc)
        if (( estimated_minutes > 0 )); then
          estimated_time="${estimated_minutes} minutes"
        else
          estimated_time="less than a minute"
        fi
      else
        estimated_time="calculating..."
      fi
    else
      estimated_time="calculating..."
    fi
    
    update_status $subtask_percent "Loading patients data ($current_file/$total_files)" "$estimated_time" 5
  fi
  
  curl -XPOST -H 'Content-type: application/json' http://fhir:8080/fhir -d "@$file"
done
record_timing "Loading patients data" $task4_start
update_status 85 "Patients data loaded" "a few seconds" 6

# Start task 5: Synchronizing perimeters
task5_start=$(date +%s)
echo "Synchronizing perimeters"
update_status 99 "Synchronizing perimeters" "a few seconds" 6
curl -XPUT -H "Authorization: Bearer $SJS_TOKEN" http://django:8080/fhir-perimeters/_sync/
record_timing "Synchronizing perimeters" $task5_start
update_status 100 "Initialization complete!" "Complete!" 7

# Record total time
total_end_time=$(date +%s)
echo "}" >> /app/status/timing_metrics.json
total_start_time=$(date -d "$(jq -r .start_time /app/status/timing_metrics.json)" +%s)
total_duration=$((total_end_time - total_start_time))
total_duration_human="$((total_duration / 3600))h $((total_duration % 3600 / 60))m $((total_duration % 60))s"

# Update timing metrics with total time
jq --arg end "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
   --arg dur "$total_duration" \
   --arg dur_h "$total_duration_human" \
   '. + {end_time: $end, total_duration_seconds: $dur|tonumber, total_duration_human: $dur_h}' \
   /app/status/timing_metrics.json > /app/status/timing_metrics_temp.json && mv /app/status/timing_metrics_temp.json /app/status/timing_metrics.json

# Create completion flag file
echo "INITIALIZATION COMPLETE" > /app/status/initialization-complete.flag

echo "All initialization tasks completed successfully in $total_duration_human!"
echo "Timing metrics have been saved to /app/status/timing_metrics.json"

sleep infinity