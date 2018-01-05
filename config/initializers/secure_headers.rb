SecureHeaders::Configuration.default do |config|

  # Unblock PDF downloading for student report
  config.x_download_options = nil

  config.csp = {
    default_src: %w('self' https:),  # This is the same as Configuration.default.
                                     # SecureHeaders requires a non-nil default_src csp.

    script_src: %w(https:),          # This is the same as Configuration.default.
                                     # SecureHeaders requires a non-nil script_src csp.

    object_src: %w('self'),          # This is more lenient than Configuration.default.
                                     # This enables viewing the Student Report PDF.

    plugin_types: %w(application/pdf)
  }

  # Turn off Content Security Policy (CSP) rules for development and test envs
  if Rails.env.test? || Rails.env.development?
    config.csp = SecureHeaders::OPT_OUT
    config.cookies = SecureHeaders::OPT_OUT
  end

end
