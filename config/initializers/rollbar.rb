Rollbar.configure do |config|
  # Import JS library through the JS build pipeline, not vendored and
  # injected through the Ruby gem.
  config.js_enabled = false

  # Without configuration, Rollbar is enabled in all environments.
  # To disable in specific environments, set config.enabled=false.
  config.access_token = ENV['ROLLBAR_ACCESS_TOKEN']
  if Rails.env.test? || Rails.env.development? || !EnvironmentVariable.is_true('SHOULD_REPORT_ERRORS')
    config.enabled = false
  end

  # By default, Rollbar will try to call the `current_user` controller method
  # to fetch the logged-in user object, and then call that object's `id`,
  # `username`, and `email` methods to fetch those properties.
  # See https://docs.rollbar.com/docs/ruby#section-person-tracking
  #
  # We don't want to collect any personally identifiable information about users.
  # It may be useful to connect error information to error information in logs,
  # so we send along an obfuscated identifier.
  config.person_method = 'rollbar_anonymized_person_method'
  config.person_id_method = 'rollbar_person_anonymized_identifier'
  config.person_username_method = nil
  config.person_email_method = nil

  # If you want to attach custom data to all exception and message reports,
  # provide a lambda like the following. It should return a hash.
  config.custom_data_method = lambda {
    {
      district_key: ENV["DISTRICT_KEY"]
    }
  }

  # For privacy and security, do not log any parameters to Rollbar other than the URL,
  # since whitelists are hard to maintain accurately as you build things over time.
  # Similar to filter_parameter_logging.rb.
  #
  # Several config items below default to `true`, this is just being explicit that
  # we want this particular config in case defaults change later.
  #
  # See https://docs.rollbar.com/docs/ruby#section-scrubbing-items 
  # and https://docs.rollbar.com/docs/ruby#section-managing-sensitive-data 
  config.scrub_fields = :scrub_all # note that docs say this isn't recursive
  config.scrub_whitelist = [
    :district_key,
    :rollbar_safelist_alerts,
    :rollbar_safelist_caller,
    :rollbar_safelist_datacenter_name,
    :rollbar_safelist_milliseconds_to_wait,
    :rollbar_safelist_login_flags,
    :rollbar_safelist_warning_id,
    :rollbar_safelist_time_now
  ]
  config.scrub_password = true
  config.scrub_user = true
  config.randomize_scrub_length = true

  # We don't want to store IPs in Rollbar, but this information this can be useful
  # for triangulating security issues, so for now start by anonymizing now that 
  # this is available.
  config.anonymize_user_ip = true
end
