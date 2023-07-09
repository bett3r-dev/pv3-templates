#!/bin/bash

# Set the default base folder to 'services'
base_folder="./packages"

# Parse command-line options
while [ "$#" -gt 0 ]; do
  case "$1" in
    -f|--services-folder)
      if [ -z "$2" ]; then
        echo "Error: Option $1 requires an argument"
        exit 1
      fi
      base_folder="$2"
      shift 2
      ;;
    -n)
      debug_param="true"
      shift
      ;;
    *)
      # Assume the first non-option argument is the service name
      if [ -z "${service_name}" ]; then
        service_name="$1"
        shift
      else
        # Collect the remaining parameters to pass them to the yarn start command
        extra_params+=("$1")
        shift
      fi
      ;;
  esac
done

# Check if the service name is provided
if [ -z "${service_name}" ]; then
  echo "Usage: $0 [-f|--services-folder <base_folder>] [-n] <service_name>"
  exit 1
fi

service_folder="${base_folder}/${service_name}"
# Check if the specified folder exists
if [ ! -d "${service_folder}" ]; then
  echo "Error: Service folder '${service_folder}' does not exist."
  exit 1
fi

# Execute the nodemon command with the specified service
cd "$service_folder" && yarn "${extra_params[@]}" "${debug_param:+start:no-debug}"
