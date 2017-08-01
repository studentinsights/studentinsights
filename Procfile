web: if [ "$USE_QUOTAGUARD" = true ]; then bundle exec puma -C config/puma.rb; else bin/qgsocksify bundle exec puma -C config/puma.rb; fi
worker: bundle exec rake jobs:work
