web: if [ "$DEMO_SITE" = true ]; then bundle exec puma -C config/puma.rb; else bin/qgsocksify bin/start-stunnel bundle exec puma -C config/puma.rb; fi
worker: bin/start-stunnel bundle exec sidekiq
