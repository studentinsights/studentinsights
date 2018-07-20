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

    # service config
    default_env['USE_MOCK_LDAP'] = 'true'
    default_env['MOCK_LDAP_PASSWORD'] = 'demo-password'
    default_env['AWS_REGION'] = 'us-west-2'
    default_env['MIXPANEL_TOKEN'] = 'foo';
    default_env['ROLLBAR_JS_ACCESS_TOKEN'] = 'foo';

    # feature switches
    default_env['ENABLE_CLASS_LISTS'] = 'true'
    default_env['ENABLE_COUNSELOR_BASED_FEED'] = 'true'
    default_env['HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8'] = 'true'

    # only set values if ENV hasn't already set them (ie, allow command line overrides)
    default_env.each do |key, value|
      next if ENV.has_key?(key)
      ENV[key] = value
    end
  end
end
