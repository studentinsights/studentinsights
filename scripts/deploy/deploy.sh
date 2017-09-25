SOMERVILLE_PROD_HEROKU_APP_NAME=$1
DEMO_HEROKU_APP_NAME=$2

if [ -z "$SOMERVILLE_PROD_HEROKU_APP_NAME" ]; then
  echo "🚨  🚨  🚨  Please supply a Somerville production Heorku app name."; exit 0;
fi

if [ -z "$DEMO_HEROKU_APP_NAME" ]; then
  echo "🚨  🚨  🚨  Please supply a demo Heorku app name."; exit 0;
fi

# Deploy to Somerville production app and migrate
echo "🚢  🚢  🚢  Deploying code to the Somerville production app.";
git push heroku master
echo;

echo "⚙  ⚙  ⚙  Migrating the database.";
heroku run rake db:migrate --app "$SOMERVILLE_PROD_HEROKU_APP_NAME"
echo;

# Deploy to demo app and migrate
echo "🚢  🚢  🚢  Deploying code to the demo Heroku app.";
git push heroku-demo master
echo;

echo "⚙  ⚙  ⚙  Migrating the database.";
heroku run rake db:migrate --app "$DEMO_HEROKU_APP_NAME"
echo;
