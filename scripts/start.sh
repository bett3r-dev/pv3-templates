#!/bin/bash

# Check if the parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <service_name>"
  exit 1
fi

service_name="$1"
service_folder="services/${service_name}"

# Check if the specified folder exists
if [ ! -d "${service_folder}" ]; then
  echo "Error: Service folder '${service_folder}' does not exist."
  exit 1
fi

# Execute the nodemon command with the specified service
nodemon "${service_folder}/index.ts"
