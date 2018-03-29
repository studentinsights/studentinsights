web: if [ "$USE_QUOTAGUARD" = true ]; then bin/qgsocksify bundle exec puma -C config/puma.rb; else bundle exec puma -C config/puma.rb; fi
worker: bundle exec rake jobs:work
