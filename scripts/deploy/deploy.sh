# Pass in the name of all the git remotes to deploy to as arguments

for remote in "$@"
do
    echo "🚢  🚢  🚢  Deploying code to $remote.";
    git push $remote master
    echo;
    echo "⚙  ⚙  ⚙  Migrating the database for $remote.";
    heroku run rake db:migrate --remote $remote
    echo;
done
