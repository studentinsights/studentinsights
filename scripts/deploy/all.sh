# Deploy to all sites in parallel
echo "🚢  Fetching from GitHub...";
git fetch origin

echo "🚢  Deploying...";
yarn run concurrently --kill-others \
  'scripts/deploy/deploy.sh demo' \
  'scripts/deploy/deploy.sh somerville' \
  'scripts/deploy/deploy.sh new-bedford' \

echo "🚢  Done.";