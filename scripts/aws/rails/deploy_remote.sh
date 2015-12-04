# Remote script to start the production image on a provisioned Rails instance.
#
# usage: scripts/rails_deploy.sh POSTGRES_IP_ADDRESS
POSTGRES_IP_ADDRESS=$1


echo "Deploying Rails!"

echo "Pulling latest container..."
docker pull kevinrobinson/somerville-teacher-tool:somerville_production_rails

# Stop the container if it's already running
# TODO(kr) This isn't a great idea for a real production system, bouncing the container
# means there will be some downtime here (vs. Unicorn's rolling processes).  You can 
# see this even refreshing the page manually.
RAILS_INFO=$(docker inspect rails)
if [ $? -eq 0 ]
then
  echo "Stopping and removing the running Rails container..."
  docker stop rails
  docker rm rails
fi

# Start Rails as a daemon
echo "Starting Rails container as daemon..."
docker run \
  -d \
  -p 80:3000 \
  --name rails \
  -e 'RAILS_ENV=production' \
  -e "DATABASE_URL=postgresql://postgres@$POSTGRES_IP_ADDRESS/homeroom_production" \
  kevinrobinson/somerville-teacher-tool:somerville_production_rails \
  bundle exec puma -t 5:5 -p 3000 -e production

# TODO(kr) nginx

echo "Done."