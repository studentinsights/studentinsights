web: if [ "$DEMO_SITE" = true ] then bundle exec unicorn -p $PORT -c ./config/unicorn.rb else bin/qgsocksify bundle exec unicorn -p $PORT -c ./config/unicorn.rb fi
