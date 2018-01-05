SecureHeaders::Configuration.default do |config|

  # Unblock PDF downloading for student report
  config.x_download_options = nil

  # Opt out of CSP; these block Rollbar and Mixpanel in production
  config.csp = SecureHeaders::OPT_OUT

  # Turn off Content Security Policy (CSP) rules for development and test envs
  if Rails.env.test? || Rails.env.development?
    config.cookies = SecureHeaders::OPT_OUT
  end

end
