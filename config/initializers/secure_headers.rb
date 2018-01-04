SecureHeaders::Configuration.default do |config|

  # Unblock PDF downloading for student report
  config.x_download_options = nil

  # Turn off Content Security Policy (CSP) rules for development and test envs
  if Rails.env.test? || Rails.env.development?
    config.csp = SecureHeaders::OPT_OUT
    config.cookies = SecureHeaders::OPT_OUT
  end

end
