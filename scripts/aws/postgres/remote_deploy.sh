# Remote script to run the production Postgres image.
# TODO(kr) add in password for production
POSTGRES_USER=$1
POSTGRES_PASSWORD=$2

# Stop the container if it's already running
RAILS_INFO=$(docker inspect postgres)
if [ $? -eq 0 ]
then
  echo "Stopping and removing the running Postgres container..."
  docker stop postgres
  docker rm postgres
fi


echo "Starting Postgres container as daemon, mapping EBS volume for data..."
docker run \
  --name postgres \
  -p 5432:5432 \
  -v /mnt/ebs-a/postgres_volumes/data:/var/lib/postgresql/data \
  -d \
  postgres

echo "Done remote deploy."