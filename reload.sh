#!/usr/bin/env sh

apk add --no-cache inotify-tools

# Watch for config changes in /etc/nginx/conf.d
inotifywait -m -e modify /etc/nginx/nginx.conf |
while read fpath action file; do
  echo "Config file change detected: $file"
  nginx -s reload
done &