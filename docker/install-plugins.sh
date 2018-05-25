#!/usr/bin/env bash

working_dir="/var/app"
plugins_dir="plugins/enabled"

cd "$working_dir"

# npm install plugins
for target in ${plugins_dir}/* ; do
  if [ -d "$target" ]; then
    echo 'Installing dependencies for ' $(basename "$target")
    cd "$target"
    npm install --unsafe
    # This is dirty but we are in a development environment, who care
    chmod 777 node_modules/
    cd "$working_dir"
  fi
done
