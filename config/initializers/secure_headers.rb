SecureHeaders::Configuration.default do |config|

  # Unblock PDF downloading for student report and for IEP-at-a-glance
  config.x_download_options = nil
  
  if EnvironmentVariable.is_true('ENABLE_CSP')
    config.csp = SecureHeaders::OPT_OUT # don't enforce yet
    config.csp_report_only = { # don't enforce yet
      # core resources
      default_src: %w('self' https:),
      base_uri: %w('self' https:),
      manifest_src: %w('self' https:),
      connect_src: %w('self' https:),
      form_action: %w('self' https:),
      script_src: %w('unsafe-inline' https: api.mixpanel.com cdn.mxpnl.com https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/),

      # most of these are from react-select
      # see https://github.com/JedWatson/react-select/issues/2030
      # and https://github.com/JedWatson/react-input-autosize#csp-and-the-ie-clear-indicator
      style_src: %w(
        'self'
        'sha256-0nyLRBz+flfRx09c4cmwCuyAActw00JI7EotsctBGyE='
        'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='
        'sha256-0A52LJhsO5+DZbOwJT8O6MYgDV+bXVxvgzJm0x3jxnI='
        'sha256-Ns85mrVfDtTI+AJP+HXSBWflADJ/6n0q5JKJC7KktSQ='
        https:
        fonts.googleapis.com
        ),
      font_src: %w('self' https: data: fonts.gstatic.com),
      img_src: %w('self' https: data:),
      report_uri: %w(https://studentinsights-csp-logger.herokuapp.com/csp),

      # disable others
      block_all_mixed_content: true, # see http://www.w3.org/TR/mixed-content/
      upgrade_insecure_requests: true, # see https://www.w3.org/TR/upgrade-insecure-requests/
      child_src: %w('none'),
      frame_ancestors: %w('none'),
      media_src: %w('none'),
      object_src: %w('none'),
      worker_src: %w('none'),
      plugin_types: nil,
    }
  else
    # Opt out of CSP
    # These block external resources like Google Fonts,
    # Rollbar and Mixpanel in production
    config.csp = SecureHeaders::OPT_OUT
  end


  # Turn off Content Security Policy (CSP) rules for development and test envs
  if Rails.env.test? || Rails.env.development?
    config.cookies = SecureHeaders::OPT_OUT
  end

end
