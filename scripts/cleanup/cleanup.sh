echo "Cleaning tmp folder..."
rm -rf tmp/*
  
echo "Cleaning data folder..."
rm -rf data/*

echo "Cleaning log folder..."
rm -rf log/*

echo "Cleaning build folders..."
rm -rf public/build/*
rm -rf public/dev/*

echo "Cleaning ignored files..."
git clean -xf

echo
echo "Logging out of Heroku..."; echo
heroku logout
echo
