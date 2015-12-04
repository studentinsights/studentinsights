#!/bin/bash
# This builds artifacts needed by the production Rails image (eg, asset manifests).
# It cleans folders, generates the artifacts and then builds and pushes the production image.
#
# Credentials for AWS and Docker Hub need to have been set beforehand, and the AWS CLI
# needs to be installed.
#
# Any tests should have run and passed at this point.

echo "Cleaning previously built assets from dev or prod builds..."
clean_assets

echo "Building production assets..."
docker-compose run -e 'RAILS_ENV=production' rails bundle exec rake assets:clean assets:precompile
# Note that assets:clean doesn't remove everything, and assets:clobber will delete the jquery-ui assets
# in the public folder, so this could be improved.

echo "Copying assets to S3..."
aws s3 cp public/assets s3://somerville-teaching-tool-cdn/production/assets --recursive

# Update the username here for Docker Hub.
echo "Building the production Rails image..."
docker build -t kevinrobinson/somerville-teacher-tool:somerville_production_rails .

echo "Pushing the production Rails image to the Docker registry..."
docker push kevinrobinson/somerville-teacher-tool:somerville_production_rails

echo "Clearing any assets we generated in the process..."
clean_assets

echo "Done."
