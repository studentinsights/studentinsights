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
  # unsafe-inline comes primarily from react-select, highcharts, react-beautiful-dnd
  style_shas = [
    # react-select, all pages
    # see https://github.com/JedWatson/react-select/issues/2030
    # and https://github.com/JedWatson/react-input-autosize#csp-and-the-ie-clear-indicator
    "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
    "'sha256-0nyLRBz+flfRx09c4cmwCuyAActw00JI7EotsctBGyE='",

    # profile reading tab initial load, from highcharts
    "'sha256-uriPziaB9m7s2kuEbUYSfZG/ZKx+e7Syll/tMzJ2y5A='",
    "'sha256-xoNN63L9AAEOpg5YcXPLo/hZsa/ms6XGntW9P4Bv2J0='",
    "'sha256-XTOOWbMsh6dXtrIPLf0Ophom1MWWbAY0gwI/5MOfdY0='",
    "'sha256-wkY2X5hecQzbhnFCqvTpwrUJ1f4X8LH5WFjYUzv1wmU='",
    "'sha256-udgQtB6hEsTIO6UAImy1cFAVzbYYw2YrVpiquOgu2/o='",
    "'sha256-97o4u6NOOXKKCCQ/RV8J53F81vXBBOI8bZ5/3dfFuLs='",

    # profile reading tab interactions, from highcharts
    "'sha256-w5OABP7j65F1iI5Hng+mWsM0ky15yFPQoKQYGkvb9a8='",
    "'sha256-pK/LYSGXm1ClC09hQOVqdn5VZhvogTihtYVcLGMlpG4='",
    "'sha256-LW4oa6lbLzLbxjX78nPs07Cfh2l0e1/P1cjf6qF2rQY='",
    "'sha256-FDBiBdM77urXZVlGGidDW7/i5glcDUz7ZKR7PxOGxZs='",

    # profile discipline tab, from highcharts:
    "'sha256-7wj/+4oyhC/Un8WKFeS81vcvueSVhV/Hk8Tuw/NlDC8='",

    # class list
    # see https://github.com/atlassian/react-beautiful-dnd/blob/master/src/view/style-marshal/style-marshal.js#L46
    "'sha256-4EtUpXBBU3YUFlvo142ikz8GtQEMP031r72aTOS2hRA='",
    "'sha256-0A52LJhsO5+DZbOwJT8O6MYgDV+bXVxvgzJm0x3jxnI='",
    "'sha256-Ns85mrVfDtTI+AJP+HXSBWflADJ/6n0q5JKJC7KktSQ='"
  ]
  report_uri = ENV['CSP_REPORT_URI']
  policy = {
    # core resources
    default_src: %w('self' https:),
    base_uri: %w('self' https:),
    manifest_src: %w('self' https:),
    connect_src: %w('self' https:),
    form_action: %w('self' https:),
    script_src: %w('unsafe-inline' https: api.mixpanel.com cdn.mxpnl.com https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/),
    style_src: %w('unsafe-inline' https: data: fonts.googleapis.com) + style_shas,
    font_src: %w('self' https: data: fonts.gstatic.com),
    img_src: %w('self' https: data:),
    report_uri: [report_uri],

    # disable others
    block_all_mixed_content: true, # see http://www.w3.org/TR/mixed-content/
    upgrade_insecure_requests: true, # see https://www.w3.org/TR/upgrade-insecure-requests/
    child_src: %w('none'),
    frame_ancestors: %w('none'),
    media_src: %w('none'),
    object_src: %w('none'),
    worker_src: %w('none'),
    plugin_types: nil
  }

  # collect additional report-only data on these violations, but don't enforce
  report_only_policy = {
    script_src: %w('self' https: api.mixpanel.com cdn.mxpnl.com https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/),
    style_src: %w('self' https: fonts.googleapis.com),
    report_uri: [report_uri]
  }

  # Enforce CSP or report only
  # CSP and HTTPS cookies are not enforced locally or in test
  if Rails.env.test? || Rails.env.development?
    config.csp = SecureHeaders::OPT_OUT
    config.cookies = SecureHeaders::OPT_OUT # no https locally
    config.csp_report_only = SecureHeaders::OPT_OUT
  elsif EnvironmentVariable.is_true('CSP_REPORT_ONLY_WITHOUT_ENFORCEMENT')
    config.csp = SecureHeaders::OPT_OUT
    config.csp_report_only = policy.merge(report_only_policy)
  else
    config.csp = policy
    config.csp_report_only = report_only_policy
  end
end
