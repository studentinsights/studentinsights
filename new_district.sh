DISTRICT_NAME=$1

if [ -z "$DISTRICT_NAME" ]; then
  echo "🚨  🚨  🚨  Please supply a district name."; exit 0;
else
  echo "District name: $DISTRICT_NAME."
fi

HEROKU_APP_NAME=$(sed -e 's/ /-/g' <<< "$DISTRICT_NAME" | awk '{print tolower($0)}')

echo "Creating Heroku app $HEROKU_APP_NAME..."

heroku create $HEROKU_APP_NAME
