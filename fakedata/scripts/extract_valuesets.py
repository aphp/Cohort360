import json
import uuid
from collections import defaultdict
import argparse
import os
import re
import datetime
from pathlib import Path


def is_target_structure(obj):
    """
    Check if an object matches the target structure:
    {
        system: string;
        code: string;
        display?: string;
    }
    """
    if not isinstance(obj, dict):
        return False
    
    # Check if object has required keys
    if 'system' not in obj or 'code' not in obj:
        return False
    
    # Check if values are strings
    if not isinstance(obj['system'], str) or not isinstance(obj['code'], str):
        return False
        
    # If display exists, it should be a string
    if 'display' in obj and not isinstance(obj['display'], str):
        return False
        
    return True


def find_target_structures(data, path=None, results=None, within_resource_type=None):
    """
    Recursively search through JSON data to find all instances of the target structure.
    Tracks the JSON path of each structure including resource type.
    """
    if results is None:
        results = []
    if path is None:
        path = []
    
    resource_type = within_resource_type
    # Extract resourceType if available
    if isinstance(data, dict):
        if "resource" in data and isinstance(data["resource"], dict):
            if "resourceType" in data["resource"]:
                resource_type = data["resource"]["resourceType"]
        
        # Check if current object matches our target structure
        if is_target_structure(data):
            # Create a dot-separated path string
            path_str = ".".join(path)
            
            # Find the resource type by traversing up
            # Start from current path and move up to find resource
            current_data = data
            temp_path = path.copy()
            
            while temp_path and resource_type is None:
                # Go one level up
                temp_path.pop()
                # Rebuild the object at this level
                current_data = data
                for key in temp_path:
                    if key in current_data:
                        current_data = current_data[key]
                    else:
                        break
                
                # Check if this level has resourceType
                if isinstance(current_data, dict) and "resourceType" in current_data:
                    resource_type = current_data["resourceType"]
            
            # Prepend resourceType if found
            if resource_type and path_str:
                path_str = f"{resource_type}.{path_str}"
            elif resource_type:
                path_str = resource_type
                
            # Add path information to the structure
            result_data = data.copy()
            result_data["_path"] = path_str
            results.append(result_data)
        
        # Recursively check all values
        for key, value in data.items():
            find_target_structures(value, path + [key], results, resource_type)
    
    elif isinstance(data, list):
        # Recursively check all items in the list
        for item in data:
            find_target_structures(item, path, results, resource_type)
    
    return results

def group_by_system_and_path(structures, existing_referentials):
    """
    Group the structures by their combined 'system' value and path.
    """
    grouped = existing_referentials
    
    for structure in structures:
        system = structure['system']
        path = structure.get('_path', 'unknown')
        
        # Create a combined key using system and path
        system_path_key = f"{system}|{path}"
        
        code_data = {
            'code': structure['code']
        }
        if 'display' in structure:
            code_data['display'] = structure['display']

        if system_path_key not in grouped:
            grouped[system_path_key] = {}
            
        if structure['code'] not in grouped[system_path_key]:
            grouped[system_path_key][structure['code']] = code_data
    
    return grouped

def process_json_file(file_path, existing_referentials):
    """
    Process a JSON file to extract and organize the target structures.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Find all instances of the target structure with path information
        target_structures = find_target_structures(data)
        
        # Group them by system and path
        grouped = group_by_system_and_path(target_structures, existing_referentials)
               
        return grouped
    
    except Exception as e:
        print(f"Error processing the file: {e}")
        return None

def generate_fhir_resources(referentials, output_dir):
    """
    Generate both CodeSystem and ValueSet FHIR resources from referentials.
    
    Args:
        referentials (dict): The grouped referentials with system|path as keys
        output_dir (str): Directory where FHIR resources will be saved
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    valuesets_info = []
    
    # Get current date in FHIR format
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    for system_path, codes in referentials.items():
        # Skip if no codes
        if not codes:
            continue
            
        # Split the key into system and path
        system, path = system_path.split('|', 1)
        
        url = f"{system}/{path}"
        # Generate a file-safe ID from system and path
        # Replace non-alphanumeric chars with dashes and avoid double dashes
        safe_id = re.sub(r'[^a-zA-Z0-9]+', '-', f"{path}-{system}").lower()
        safe_id = re.sub(r'-+', '-', safe_id).strip('-')
        
        # Create a human-readable name and title
        path_parts = path.split('.')
        resource_type = path_parts[0] if path_parts else "Unknown"
        
        cs_name = f"{resource_type}_{safe_id}_CS"[:64]
        vs_name = f"{resource_type}_{safe_id}_VS"[:64]
        
        # Generate stable UUIDs based on system and path
        cs_uuid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{system}|{path}|CS"))
        #vs_uuid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{system}|{path}|VS"))
        
        # 1. Create CodeSystem first
        codesystem = {
            "resourceType": "CodeSystem",
            "id": f"{safe_id}-cs",
            "url": cs_uuid,  # This URL must be unique and stable
            "version": "1.0.0",
            "name": cs_name,
            "title": f"CodeSystem for {path} with original system {system}",
            "status": "active",
            "date": current_date,
            "description": f"CodeSystem containing codes from {system} used in {path}",
            "content": "complete",  # This tells HAPI this is a complete list of codes
            "caseSensitive": True,
            "concept": []
        }
        
        # Add all codes to the CodeSystem
        for code, code_data in codes.items():
            concept = {
                "code": code
            }
            if "display" in code_data:
                concept["display"] = code_data["display"]
            
            codesystem["concept"].append(concept)
        
        # 2. Create ValueSet that references the CodeSystem
        valueset = {
            "resourceType": "ValueSet",
            "id": f"{safe_id}-vs",
            "url": url,  # This URL must be unique and stable
            "version": "1.0.0",
            "name": vs_name,
            "title": f"ValueSet for {path} with system {system}",
            "status": "active",
            "date": current_date,
            "description": f"ValueSet containing codes from {system} used in {path}",
            "compose": {
                "include": [
                    {
                        "system": codesystem["url"],
                        # Don't include concepts here, they're in the CodeSystem
                    }
                ]
            }
        }
        
        # Write the CodeSystem to a file
        cs_filename = f"{safe_id}-codesystem.json"
        cs_file_path = os.path.join(output_dir, cs_filename)
        with open(cs_file_path, 'w', encoding='utf-8') as file:
            json.dump(codesystem, file, indent=2)
        
        # Write the ValueSet to a file
        vs_filename = f"{safe_id}-valueset.json"
        vs_file_path = os.path.join(output_dir, vs_filename)
        with open(vs_file_path, 'w', encoding='utf-8') as file:
            json.dump(valueset, file, indent=2)
        
        valuesets_info.append({
            "resource": resource_type,
            "path": path,
            "system": system,
            "url": url,
            "filename": vs_filename
        })
        print(f"Created CodeSystem: {cs_file_path}")
        print(f"Created ValueSet: {vs_file_path}")
    return valuesets_info


def generate_markdown_table(valuesets_info, output_file):
    """
    Generate a markdown table with information about the valuesets.
    
    Args:
        valuesets_info (list): List of dictionaries containing valueset information
        output_file (str): Path to the output markdown file
    """
    # Create the markdown table header
    markdown_content = "# Generated ValueSets\n\n"
    markdown_content += "| Resource | Path | System | URL |\n"
    markdown_content += "|----------|------|--------|-----|\n"
    
    # Add each valueset as a row in the table
    for vs_info in valuesets_info:
        markdown_content += f"| {vs_info['resource']} | {vs_info['path']} | {vs_info['system']} | {vs_info['url']} |\n"
    
    # Write the markdown content to the file
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(markdown_content)
    
    print(f"Generated markdown table: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract valuesets from FHIR resources.')
    parser.add_argument('--input-dir', required=True, help='Directory containing FHIR resources')
    parser.add_argument('--output-dir', required=True, help='Directory to store generated valuesets')
    parser.add_argument('--markdown-file', required=True, help='Path to output markdown file')
    
    args = parser.parse_args()
    
    # Process all files in the input directory
    referentials = defaultdict(dict)
    for filename in os.listdir(args.input_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(args.input_dir, filename)
            try:
                referentials = process_json_file(file_path, referentials)
                print(f"Processed: {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
    
    # Generate valuesets and get information about them
    valuesets_info = generate_fhir_resources(referentials, args.output_dir)
    
    # Generate markdown table
    generate_markdown_table(valuesets_info, args.markdown_file)
