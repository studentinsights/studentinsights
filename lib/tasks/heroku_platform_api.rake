namespace :heroku_platform_api do
  desc 'Restart heroku web dyno'
  task restart_web_dynos: :environment do
    heroku = PlatformAPI.connect_oauth(ENV.fetch('HEROKU_OAUTH_TOKEN'))
    dynos = heroku.dyno.list(ENV.fetch('HEROKU_APP_NAME'))

    dynos.each do |dyno|
      if dyno.fetch("type") == "web"
        heroku.dyno.restart(ENV.fetch('HEROKU_APP_NAME'), dyno.fetch('name'))
      end
    end
  end
end
