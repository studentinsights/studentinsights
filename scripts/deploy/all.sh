# Deploy to all sites in parallel
echo "🚢  Fetching from GitHub..."
git fetch origin

# Double quotes since the shell and yarn both are escaping.
# Add a name and a color for any new remotes.
echo "🚢  Deploying..."
yarn concurrently \
  --names "demo,somerville,bedford,new-bedford" \
  -c "yellow.bold,blue.bold,magenta.bold,cyan.bold" \
  "'scripts/deploy/deploy.sh demo'" \
  "'scripts/deploy/deploy.sh somerville'" \
  "'scripts/deploy/deploy.sh bedford'" \
  "'scripts/deploy/deploy.sh new-bedford'"

echo "🚢  Done."