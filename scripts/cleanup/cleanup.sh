if [ -d tmp ]; then
  echo "Deleting /tmp folder..."
  rm -rf tmp
  echo
else
  echo "No /tmp folder to delete..."
  echo
fi

if [ -d data ]; then
  echo "Deleting /data folder..."
  rm -rf data
  echo
else
  echo "No /data folder to delete..."
  echo
fi

if [ -f config/local_env.yml ]; then
  echo "Deleting local_env.yml..."
  rm config/local_env.yml
  echo
else
  echo "No local_env.yml to delete..."
  echo
fi

echo "Logging out of Heroku..."; echo
heroku logout
echo

echo "Resetting the database..."; echo
rake db:reset