should_use_mock_ldap = ::EnvironmentVariable.is_true('USE_TEST_PALS_LDAP')

env_is_production = Rails.env.production?

district_is_demo = (ENV.fetch('DISTRICT_KEY') == 'demo')

# Guard on app initialize to make sure that we're never using the fake demo
# accounts and password in production outside of the demo Heroku site
if should_use_mock_ldap && env_is_production && !district_is_demo
  raise 'Mocking LDAP not allowed in production except for demo site'
end

# Guard to make srue that if we're using the fake demo accounts,
# we also have the demo password value set
if should_use_mock_ldap && ENV['TEST_PALS_LDAP_PASSWORD'].nil?
  raise 'Missing mock LDAP password'
end