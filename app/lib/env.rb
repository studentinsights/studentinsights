class Env
  # ENV setup that's shared across development and test modes.
  #
  # For config that applies to only one env, put those in
  # development.rb and test.rb like normal.
  def self.set_for_development_and_test!
    return unless Rails.env.development? || Rails.env.test?
    default_env = {}

    # instance config
    default_env['DISTRICT_KEY'] = 'somerville'
    default_env['DISTRICT_NAME'] = 'Localhost Public Schools'
    default_env['CANONICAL_DOMAIN'] = nil # no redirection or HTTPS locally
    default_env['MULTIFACTOR_AUTHENTICATOR_ROTP_CONFIG_JSON'] = '{"issuer_base":"student-insights-multifactor-authenticator-educator"}'
    default_env['CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS'] = '2000'
    default_env['PASSWORD_CHECKER_SECRET64'] = "IyIMFkLrcvHY/fDMomHt7yYB6EgjGj532cGNhymmCPg=\n"

    # service config
    default_env['USE_MOCK_LDAP'] = 'true'
    default_env['MOCK_LDAP_PASSWORD'] = 'demo-password'
    default_env['AWS_REGION'] = 'us-west-2'
    default_env['ROLLBAR_JS_ACCESS_TOKEN'] = 'foo';
    default_env['ROLLBAR_ACCESS_TOKEN'] = 'fake_rollbar_access_token';
    default_env['TWILIO_CONFIG_JSON'] = '{"account_sid":"fake-twilio-sid-foo","auth_token":"fake-twilio-auth-token-foo","sending_number":"+15555551234"}'
    default_env['MAILGUN_API_KEY'] = 'fake-mailgun-api-key'
    default_env['MAILGUN_DOMAIN'] = 'fake-mailgun-domain'

    # feature switches
    default_env['ENABLE_COUNSELOR_BASED_FEED'] = 'true'
    default_env['ENABLE_HOUSEMASTER_BASED_FEED'] = 'true'
    default_env['ENABLE_SECTION_BASED_FEED'] = 'true'
    default_env['ENABLE_COUNSELOR_MEETINGS'] = 'true'
    default_env['HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8'] = 'false'
    default_env['ENABLE_MASQUERADING'] = 'true'
    default_env['ENABLE_STUDENT_VOICE_SURVEYS_UPLOADS'] = 'true'
    default_env['STUDENT_VOICE_SURVEY_FORM_URL'] = 'https://example.com/this-is-the-survey'
    default_env['SHOULD_SHOW_TEAM_ICONS'] = 'false'
    default_env['SHOW_WORK_BOARD'] = 'true'
    default_env['READING_ENTRY_EDUCATOR_AUTHORIZATIONS_JSON'] = '{"2:3":["uri"], "6:5":["uri"]}'
    default_env['READING_ENTRY_OPEN_BENCHMARK_PERIODS_JSON'] = '{"periods":[{"benchmark_school_year":2018, "benchmark_period_key":"winter"}]}'

    # only set values if ENV hasn't already set them (ie, allow command line overrides)
    default_env.each do |key, value|
      next if ENV.has_key?(key)
      ENV[key] = value
    end
  end
end
