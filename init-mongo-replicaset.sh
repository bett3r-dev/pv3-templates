if [ -z "$1" ]; then
  host="mongo"
else
  host="$1"
fi

docker exec -it $(docker ps --filter name=mongo -q) mongosh --eval "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: '$host:27017' }]})"

