DISTRICT_NAME=$1

if [ -z "$DISTRICT_NAME" ]; then
  echo "🚨  🚨  🚨  Please supply a district name."; exit 0;
else
  echo "District name: $DISTRICT_NAME."
fi

HEROKU_APP_NAME=$(sed -e 's/ /-/g' <<< "$DISTRICT_NAME" | awk '{print tolower($0)}')

echo "Creating Heroku app $HEROKU_APP_NAME..."

heroku create $HEROKU_APP_NAME

HEROKU_GIT_REMOTE_NAME="heroku-$HEROKU_APP_NAME-student-insights"
HEROKU_GIT_REMOTE_ADDRESS="https://git.heroku.com/$HEROKU_APP_NAME.git"

echo "Adding nodejs buildpack..."

heroku buildpacks:add --index 1 heroku/nodejs --app $HEROKU_APP_NAME

echo "Pushing code to Heroku app..."

git remote add $HEROKU_GIT_REMOTE_NAME $HEROKU_GIT_REMOTE_ADDRESS
git push $HEROKU_GIT_REMOTE_NAME master
