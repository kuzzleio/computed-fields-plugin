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
    find -L node_modules/.bin -type f -exec chmod 776 {} \;
    find node_modules/ -type d -exec chmod 755 {} \;
    cd "$working_dir"
  fi
done
