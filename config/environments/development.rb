Rails.application.configure do
  # Local env variables for dev
  env_file = File.join(Rails.root, 'config', 'local_env.yml')
  YAML.load(File.open(env_file)).each do |key, value|
    ENV[key.to_s] = value
  end if File.exists?(env_file)
  Env.set_for_development_and_test!
  ENV['ENABLE_CLASS_LISTS'] = 'true'
  ENV['USE_PLACEHOLDER_STUDENT_PHOTO'] = 'true'
  ENV['USE_PLACEHOLDER_IEP_DOCUMENT'] = 'true'
  ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = '2000'
  ENV['GOOGLE_PRIVATE_KEY'] = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXepG5a7mMHxz3\nu5UNv90R4RtVWN/wYIrexWi3u8DqD6TIXFCZ+svfCJ/j71wpSYeHnid3u9w3eUaW\nCoz19CUnGP8knU8r/duO3wHSrT8UJwhUNtp9VCw3HOfyYfKIUNsoQQknJv7hAMYz\nzrWaVTF0BST3qqnjgKP90971OqSifk7B9Jvj0jqOl0NisdXOQ3W7wgmLYB4Ep8Vm\nhp7OKZ3nz0oVzao9t48BMlcgDxiMS0l4li4WivRw/X83Is/IDwk0kHc1r8acReNe\nSrsygYDyIPz0fAlVw6Bg/V1dlMCbvKdf7l4JXyBVQ+s7Rd0kh/jPvEy9zLCCblJK\n37s0A+MTAgMBAAECggEAErOVZzIyERHMS+zoUkS+9en4ARmnuC/Vz/rJBW9pj1w0\nE2/g8Z8W6X0mmbJftfyNKNoGnw/d+H6sD3J+Wbqf6vZOlcYoKVMToXgjQPqWVZYb\nafjwZlXB3wyzZDzh1SDqayCwZm7i5oOSdNX58h5qLHFFfEr2jjm/xWLm3W7f4ZcM\nL7YiHkojWeTAk1anAB6X7MPdc1FeZqZtE6Tsy65OQf8rJoODrwhOMGu7tZs9o5fF\nPpxmKBV3twc9nwaXEolnWEXlz7rdBB0c6J3vNWpEDMPWY+86RpZUihRqSIS6vQxg\ndRII+ZG6qccZfHw7s3kde0vjXiG3OSFgL6YuWdFHFQKBgQDLkxkO9ldNApAJBuCD\npFOJJHN12as0Wq/kiAlrC43BL0e2h61e97I2ZqfZeVeRK6oV9C2E5N3zq0zASMTP\nR38QmgG5F+5akbPjEBNCraCOOQObv3Ry9S3Ik0/ypC4/rtSVs1zNMW7tIAANKlQt\nGPxWLnfUH7TkpTbcxEQQfuVafwKBgQC+fP3dE/zh6ch+QmIEu8a3udvMS+8ASRlb\nNhk/9C9EW1aDyEzzvy3f3va29erTDGcwsHJGr2gxj3TfvkuAFZBWtazrMXC3xWGe\nVleqBhLrIPAZSDcZEeJWfvGwR8WwIhrGvjaPDBxMTZ6Bj3EzA+u/LUKi2wcjMvo8\nv3//hbglbQKBgFkM051T7QRm5pLMS1HKhDAtncQjn1ybfu29BEGrICstf3U9DH3K\nZE6fwTTEe6WpMBHCalcDtoNsn3pNWqpBYDfm5nINIdrEeagN1B8KzHzqO8XZjhrr\nXUesCQDfCMwasit59lJcGWXo5Zzcs0227ErWsNw9smeCTelsgUml+LYJAoGBAKKy\nz4IMmGm87Goq+N1iJRC3xmxwTurHhMjLJDXjspuICBT2+AMYv23/WmpbEP7CEUEc\n8/47w5rRFNomBwaXZHkrI06fI89S31YGGUo3deEueOSfMbBP/ioysuwF4WvXNVeb\nD66OgX0Krt+qTN1t8+WOGuROf4IpAGLyjbkJ1YbhAoGBAJSjkKsYAUlbd6vm7fLA\nJHmsVu+Vgf+yawmQszTas94hH+OnT04Mclzz7Q6knDJsouX98BL1cjSDByGZHJ9i\nxryLk8cnWqLGJMZSrWjVM03oo9rgbo5a8snsyr4wl7dznSqLyn60BH9BJpQx9HTr\niOg1Qf0LipS2obIZ2wi8WgbA\n-----END PRIVATE KEY-----\n'
  ENV['GOOGLE_CLIENT_EMAIL'] = 'student-insights@student-insights-238711.iam.gserviceaccount.com'
  ENV['GOOGLE_PROJECT_ID'] = '102517779824220641067'
  ENV['GOOGLE_ACCOUNT_TYPE'] = 'service_account'


  config.secret_key_base = SecureRandom.hex(64)
  
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  if Rails.root.join('tmp/caching-dev.txt').exist?
    config.action_controller.perform_caching = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => 'public, max-age=172800'
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  config.action_mailer.perform_caching = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  # config.file_watcher = ActiveSupport::EventedFileUpdateChecker


  # --- Student Insights additions below ---
  # Adds additional error checking when serving assets at runtime.
  # Checks for improperly declared sprockets dependencies.
  # Raises helpful error messages.
  config.assets.raise_runtime_errors = true

  # Mailer config
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
  config.action_mailer.delivery_method = :file
  config.action_mailer.file_settings = { :location => Rails.root.join('tmp/mail') }
  config.action_mailer.raise_delivery_errors = true
end
