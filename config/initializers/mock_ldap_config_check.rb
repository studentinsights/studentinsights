should_use_mock_ldap = ::EnvironmentVariable.is_true('USE_MOCK_LDAP')

env_is_production = Rails.env.production?

district_is_demo = (ENV.fetch('DISTRICT_KEY') == 'demo')

# Guard to make sure that we're never using fake demo accounts and passwords
# in production except on the demo Heroku site:
if should_use_mock_ldap && env_is_production && !district_is_demo
  raise 'Mocking LDAP not allowed in production except for demo site'
end

# Guard to make sure that if we're using the fake demo accounts for auth,
# we also have demo passwords set in ENV:
if should_use_mock_ldap && env_is_production && ENV['MOCK_LDAP_PASSWORD'].nil?
  raise 'Missing mock LDAP password'
else
  ENV['MOCK_LDAP_PASSWORD'] = 'demo-password'
end