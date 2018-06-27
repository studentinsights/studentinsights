SecureHeaders::Configuration.default do |config|
  # Set these all explicitly on top of the defaults, starting from guidance in
  # https://github.com/twitter/secure_headers/blob/5c47914f9c481d8c69fb7af141ed5a79b213bfa1/README.md#configuration
  config.hsts = "max-age=#{1.week.to_i}"
  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.x_permitted_cross_domain_policies = "none"
  config.referrer_policy = %w(origin-when-cross-origin strict-origin-when-cross-origin)

  # Unblock PDF downloading for student report and for IEP-at-a-glance
  config.x_download_options = nil

  # Content security policy rules
  report_uri = ENV['CSP_REPORT_URI']
  policy = {
    # core resources
    default_src: %w('self' https:),
    base_uri: %w('self' https:),
    manifest_src: %w('self' https:),
    connect_src: %w('self' https:),
    form_action: %w('self' https:),
    script_src: %w('self' https: api.mixpanel.com),

    # unsafe-inline comes primarily from react-select and react-beautiful-dnd
    # see https://github.com/JedWatson/react-select/issues/2030
    # and https://github.com/JedWatson/react-input-autosize#csp-and-the-ie-clear-indicator
    # and https://github.com/atlassian/react-beautiful-dnd/blob/master/src/view/style-marshal/style-marshal.js#L46
    style_src: %w('unsafe-inline' https: fonts.googleapis.com),
    font_src: %w('self' https: data: fonts.gstatic.com),
    img_src: %w('self' https: data:),
    report_uri: [report_uri],

    # disable others
    block_all_mixed_content: true, # see http://www.w3.org/TR/mixed-content/
    upgrade_insecure_requests: true, # see https://www.w3.org/TR/upgrade-insecure-requests/
    child_src: %w('none'),
    frame_ancestors: %w('none'),
    media_src: %w('none'),
    object_src: %w('self' https:), # for PDF download (eg, profile packet PDF)
    worker_src: %w('none'),
    plugin_types: nil
  }

  # Enforce CSP or report only
  # CSP and HTTPS cookies are not enforced locally or in test
  if Rails.env.test? || Rails.env.development?
    config.csp = SecureHeaders::OPT_OUT
    config.cookies = SecureHeaders::OPT_OUT # no https locally
    config.csp_report_only = SecureHeaders::OPT_OUT
  elsif EnvironmentVariable.is_true('CSP_REPORT_ONLY_WITHOUT_ENFORCEMENT')
    config.csp = SecureHeaders::OPT_OUT
    config.csp_report_only = policy.except(:upgrade_insecure_requests) # some browsers complain about this in report-only mode
  else
    config.csp = policy
    config.csp_report_only = SecureHeaders::OPT_OUT
  end
end
