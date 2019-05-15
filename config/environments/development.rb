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
  # For use with studentinsights-dev Google account
  ENV['GOOGLE_PRIVATE_KEY'] = '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCKYeWIf90xpTPI\nw2RfF2ZiB4W9ObBt78oI0IWmdBtcjnYgkoRWkis/RWPEC8hvr2qupLG+CB6PaFKX\niNq0p9IE+8MYiAD54A1vZu9QO60Klx2xzt+p/RMqxhjiDqzXjjdvwXDg4EsuM0PC\nfx01+HcR7qeoG6So2VIqpZVHsrfat7BKVZnSQkiY+1/wKTNm5QTKHOnruqfu2312\nLqndTGyJX+ijhmmIEDn/wRv05xRVc8E3ydaz10QwdFx+LxmxUld4b5ZrlTOo2UHq\nLlllvf/iSGrtSva/3LRzvV4qi3GrFymyceB5GbnUKMIJcU8JR9mwwHFIvQ57hAvC\nSp0+UE5fAgMBAAECggEAQNpkcjZKecvMmxhHX/FdgC+6U9ZHgx5P9xWSrVHYyOXT\nIqzH7LKQJhTlDqnfA8iYHMT+r+qqN9dSbcYriWLlIITFCCglHPYOFdmN6nItRLtR\npVUoqUf7xZ4VZ0wtYNA71to3hoxXb42DAhIEpJiPZQ4N8NETuDYxNd9oOLPfSlb/\ngJSsZ/ZOMB7WZ1RH7RkumB6kohkZkrbB+7z7OQMuDk3fB4McIrcMH3FIc9zXu8iR\nWVal8g+e156fBt+zEr+lV+gIBpUu18nlRfUv73xFXW/axhdjeKsxgchs7IlbpRI4\n99VwOC4PyYEkp1CU0pDd/X2qzkyP6oGjAaXTPnBTUQKBgQDBkDVLWGd5W77exFpR\nPSZp0RDtDi719gKl8I5aO9eiKgAuqexsaeEBhmztvLRtFPOojVEgo7aiahzcJJRL\nULbsGPtrcmCE8PDotFtmp+RRcMfBzu+4/vvTtmR2wGDby19FfLD8hqwYfAxSNeQe\nV1pFMzzl0OKQ3PscJljMBSlu0wKBgQC3BQoTyuXgif4nmiyKkVsFlTNKBjj3EghU\nJGYxEyRIVbS7YWMly0ImkP0H89cjiaU+geWfK1YeQWMQnaDsqbLfjJ4o84cnRGVD\nlzBvHDvTq3QoCzfN+yroVT6CdCHy6/0N+/0ilD2njIwB3iSvcY0oFTJCgRPESnSe\nkOKwsrIixQKBgDJecl/e6147L5oMgmwte3eBvePSEwpSMDI6PPDiLaS3RUDfWvSD\nQNgCwQnEVzcjgpxT2c6ii34MGuJ2aliG8nLRtWsqYk9121rSxA4cll9S98hJLzx2\nrdVT2yTDvvCzJWGRpwSvjsz4SsSB3ZC/rm/fe3NaPfrwZi/XErhUh4mdAoGAIoIj\nvUmjgGvkbQkn3tS7adkQ+6MiuItA4MSgNB6c17q5Qh+Bt02U4nqyCv7SENRSQO/z\nIMjmCvxfNnHSNu1kWbxE0gng8Ol3goAOVNTo/uc0FpzO39q842O3TpehExGl/C4I\nM63p1h6tA2kkV6Q8blNYz6tQ09EKHh/JbnGzHtUCgYA/BkL+WiXs3nSlyFmJwmmJ\nyATwCiKbTZXzVTBQgxgSd9+OlWTYEcQHDp6TYIHM9bDpgluMxVH9ctRPvt44cS1a\n0Y7BjAV6VMJjIE5VtOhYN5pHQZAglt4wE8b5NvWA8/E6/KXVErOQBbmzaizddk2z\ncmGatg2+i//aRP92+8lwWQ==\n-----END PRIVATE KEY-----\n'
  ENV['GOOGLE_CLIENT_EMAIL'] = 'student-insights-dev@student-insights-dev.iam.gserviceaccount.com'
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
