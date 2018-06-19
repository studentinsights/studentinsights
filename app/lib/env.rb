class Env
  def self.set_for_development_and_test!
    return unless Rails.env.development? || Rails.env.test?

    # instance config
    ENV['DISTRICT_KEY'] = 'somerville'
    ENV['DISTRICT_NAME'] = 'Localhost Public Schools'

    # service config
    ENV['USE_MOCK_LDAP'] = 'true'
    ENV['MOCK_LDAP_PASSWORD'] = 'demo-password'
    ENV['AWS_REGION'] = 'us-west-2'
    ENV['MIXPANEL_TOKEN'] = 'foo';
    ENV['ROLLBAR_JS_ACCESS_TOKEN'] = 'foo';

    # feature switches
    ENV['ENABLE_CLASS_LISTS'] = 'true'
    ENV['ENABLE_COUNSELOR_BASED_FEED'] = 'true'
    ENV['HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8'] = 'true'
  end
end
