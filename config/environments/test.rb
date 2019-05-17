Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.
  # Set env variables
  Env.set_for_development_and_test!
  ENV['ENABLE_CLASS_LISTS'] = 'true'

    # For use with studentinsights-dev Google account
  ENV['GOOGLE_PRIVATE_KEY'] = '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCKYeWIf90xpTPI\nw2RfF2ZiB4W9ObBt78oI0IWmdBtcjnYgkoRWkis/RWPEC8hvr2qupLG+CB6PaFKX\niNq0p9IE+8MYiAD54A1vZu9QO60Klx2xzt+p/RMqxhjiDqzXjjdvwXDg4EsuM0PC\nfx01+HcR7qeoG6So2VIqpZVHsrfat7BKVZnSQkiY+1/wKTNm5QTKHOnruqfu2312\nLqndTGyJX+ijhmmIEDn/wRv05xRVc8E3ydaz10QwdFx+LxmxUld4b5ZrlTOo2UHq\nLlllvf/iSGrtSva/3LRzvV4qi3GrFymyceB5GbnUKMIJcU8JR9mwwHFIvQ57hAvC\nSp0+UE5fAgMBAAECggEAQNpkcjZKecvMmxhHX/FdgC+6U9ZHgx5P9xWSrVHYyOXT\nIqzH7LKQJhTlDqnfA8iYHMT+r+qqN9dSbcYriWLlIITFCCglHPYOFdmN6nItRLtR\npVUoqUf7xZ4VZ0wtYNA71to3hoxXb42DAhIEpJiPZQ4N8NETuDYxNd9oOLPfSlb/\ngJSsZ/ZOMB7WZ1RH7RkumB6kohkZkrbB+7z7OQMuDk3fB4McIrcMH3FIc9zXu8iR\nWVal8g+e156fBt+zEr+lV+gIBpUu18nlRfUv73xFXW/axhdjeKsxgchs7IlbpRI4\n99VwOC4PyYEkp1CU0pDd/X2qzkyP6oGjAaXTPnBTUQKBgQDBkDVLWGd5W77exFpR\nPSZp0RDtDi719gKl8I5aO9eiKgAuqexsaeEBhmztvLRtFPOojVEgo7aiahzcJJRL\nULbsGPtrcmCE8PDotFtmp+RRcMfBzu+4/vvTtmR2wGDby19FfLD8hqwYfAxSNeQe\nV1pFMzzl0OKQ3PscJljMBSlu0wKBgQC3BQoTyuXgif4nmiyKkVsFlTNKBjj3EghU\nJGYxEyRIVbS7YWMly0ImkP0H89cjiaU+geWfK1YeQWMQnaDsqbLfjJ4o84cnRGVD\nlzBvHDvTq3QoCzfN+yroVT6CdCHy6/0N+/0ilD2njIwB3iSvcY0oFTJCgRPESnSe\nkOKwsrIixQKBgDJecl/e6147L5oMgmwte3eBvePSEwpSMDI6PPDiLaS3RUDfWvSD\nQNgCwQnEVzcjgpxT2c6ii34MGuJ2aliG8nLRtWsqYk9121rSxA4cll9S98hJLzx2\nrdVT2yTDvvCzJWGRpwSvjsz4SsSB3ZC/rm/fe3NaPfrwZi/XErhUh4mdAoGAIoIj\nvUmjgGvkbQkn3tS7adkQ+6MiuItA4MSgNB6c17q5Qh+Bt02U4nqyCv7SENRSQO/z\nIMjmCvxfNnHSNu1kWbxE0gng8Ol3goAOVNTo/uc0FpzO39q842O3TpehExGl/C4I\nM63p1h6tA2kkV6Q8blNYz6tQ09EKHh/JbnGzHtUCgYA/BkL+WiXs3nSlyFmJwmmJ\nyATwCiKbTZXzVTBQgxgSd9+OlWTYEcQHDp6TYIHM9bDpgluMxVH9ctRPvt44cS1a\n0Y7BjAV6VMJjIE5VtOhYN5pHQZAglt4wE8b5NvWA8/E6/KXVErOQBbmzaizddk2z\ncmGatg2+i//aRP92+8lwWQ==\n-----END PRIVATE KEY-----\n'
  ENV['GOOGLE_CLIENT_EMAIL'] = 'student-insights-dev@student-insights-dev.iam.gserviceaccount.com'
  ENV['GOOGLE_PROJECT_ID'] = '102517779824220641067'
  ENV['GOOGLE_ACCOUNT_TYPE'] = 'service_account'

  config.secret_key_base = SecureRandom.hex(64)

  # The test environment is used exclusively to run your application's
  # test suite. You never need to work with it otherwise. Remember that
  # your test database is "scratch space" for the test suite and is wiped
  # and recreated between test runs. Don't rely on the data there!
  config.cache_classes = true

  # Eager load code on boot to match production and catch tricky bugs.
  config.eager_load = true

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    'Cache-Control' => "public, max-age=#{1.hour.seconds.to_i}"
  }

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false
  config.action_mailer.perform_caching = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  config.log_level = :info
end
