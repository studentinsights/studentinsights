# Pass in the name of all the git remotes to deploy to as arguments

# Example: ./scripts/deploy/deploy.sh somerville new-bedford heroku-demo

for remote in "$@"
do
    echo "🚢  🚢  🚢  Deploying code to $remote.";
    git push $remote origin/master:master
    echo;
    echo "⚙  ⚙  ⚙  Migrating the database for $remote.";
    heroku run rake db:migrate --remote $remote
    echo;
done
