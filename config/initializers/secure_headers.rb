SecureHeaders::Configuration.default do |config|

  # Unblock PDF downloading for student report:
  config.x_download_options = nil

  # Turn off Content Security Policy (CSP) rules for development and test envs,
  # in dev this breaks JS because we don't send JS over https in development;
  # same with test mode.
  if Rails.env.test? || Rails.env.development?
    config.csp = SecureHeaders::OPT_OUT
  end

end
