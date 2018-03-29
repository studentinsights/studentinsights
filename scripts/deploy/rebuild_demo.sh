DEMO_HEROKU_APP_NAME=somerville-teacher-tool-demo

# Deploy to demo app and migrate
echo "🚨  🚨  🚨  DANGER: About to destroy and rebuild the ⬢ $DEMO_HEROKU_APP_NAME database."
echo
read -p "🚨  🚨  🚨  This will cause downtime on $DEMO_HEROKU_APP_NAME. Continue? [y/N] " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Reset database through Heroku Postgres CLI
  echo "⚙  💻  ⚙  heroku pg:reset..."
  heroku pg:reset DATABASE_URL -a $DEMO_HEROKU_APP_NAME --confirm $DEMO_HEROKU_APP_NAME

  # Deploy to Somerville production app and migrate
  echo "⚙  💻  ⚙  rake db:schema:load..."
  heroku run DISABLE_DATABASE_ENVIRONMENT_CHECK=1 rake db:migrate --app $DEMO_HEROKU_APP_NAME

  echo "⚙  💻  ⚙  rake db:seed..."
  heroku run rake db:seed --app $DEMO_HEROKU_APP_NAME
  echo

  # Deploy to demo app and migrate
  echo "Done.  Rebuilt ⬢ $DEMO_HEROKU_APP_NAME database."
else
  echo "Aborted."
fi
