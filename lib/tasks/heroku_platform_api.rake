namespace :heroku_platform_api do
  desc 'Restart heroku web dyno'

  # To schedule automatic restarts at 5AM Eastern Time and 5PM Eastern Time,
  # set two tasks to run hourly:
  #
  # $ rake 'heroku_platform_api:restart_web_dynos[5]'
  # $ rake 'heroku_platform_api:restart_web_dynos[17]'
  #
  # Good blog post on rake tasks with arguments from Thoughtbot:
  # https://robots.thoughtbot.com/how-to-use-arguments-in-a-rake-task

  task :restart_web_dynos, [:hour] => :environment do |t, args|
    target_hour = args[:hour].to_i
    now_hour = Time.now.in_time_zone('Eastern Time (US & Canada)').hour

    if target_hour == now_hour
      puts "It feels like a good time to restart our web dynos!"
      heroku = PlatformAPI.connect_oauth(ENV.fetch('HEROKU_OAUTH_TOKEN'))
      dynos = heroku.dyno.list(ENV.fetch('HEROKU_APP_NAME'))

      dynos.each do |dyno|
        if dyno.fetch("type") == "web"
          puts "Found web dyno!"; puts

          name = dyno.fetch('name')
          puts "Restaring dyno #{name}..."; puts
          heroku.dyno.restart(ENV.fetch('HEROKU_APP_NAME'), name)

          puts "Sleeping for 60 seconds so we get a rolling restart ..."; puts
          sleep 60
        end
      end
    else
      puts "It doesn't feel like a good time to restart our web dynos right now."
    end
  end
end
