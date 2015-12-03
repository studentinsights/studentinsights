#!/bin/bash
# This will be run by Travis.
# Any tests should have run and passed at this point.

# Only run when the master branch has been merged to, not on pull requests.
echo "Checking Travis ENV for whether this is a merge to master..."
if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Done, this is a pull request."
  exit 0
elif [ "$TRAVIS_BRANCH" != "master" ]; then
  echo "Done, this is a merge to another branch."
  exit 0
fi

echo "Setting Docker Hub credentials..."
docker login --email=$DOCKER_EMAIL --password=$DOCKER_PASSWORD --username=$DOCKER_USERNAME

echo "Building and pushing the production Rails image..."
sudo aws/rails/build.sh