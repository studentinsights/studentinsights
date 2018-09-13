# This code mocks the LDAP services that provide authentication to Student Insights
# by implementing the `bind` method. It uses a dummy password defined in ENV
# instead of real passwords.

# We will consume this mock service in three places: (1) the test suite, (2) the
# local development environment, (3) our demo site.

# The advantage to mocking an LDAP service in this way is that developers
# will exercise the code in our custom LDAP Devise strategy constantly,
# instead of relying on a different auth mechanism locally and only exercising
# LDAP-related code in production.

class MockLDAP

  def initialize(options)
    @options = options
    @login_username = options[:auth][:username]
    @password = options[:auth][:password]
  end

  def bind
    raise 'Mock LDAP called but ShouldUseMockLDAP false' unless ShouldUseMockLDAP.new.check

    return false unless login_username_present?

    return true if unauthenticated_bind?  # Mock insecurely configured LDAP: see more below.

    return false unless password_correct?

    return true
  end

  def get_operation_result
  end

  private

  def login_username_present?
    PerDistrict.new.find_educator_from_login_text(@login_username)
  end

  def unauthenticated_bind?
    # This mocks the worst-case scenario for LDAP setup: the unauthenticated
    # bind setting, which responds to a correct user email and a blank password
    # with a "success" response that establishes an "anonymous authorization state."

    # The LDAP spec states that "Servers SHOULD by default fail Unauthenticated
    # Bind requests with a resultCode of unwillingToPerform."
    # (https://tools.ietf.org/rfc/rfc4513.txt, 5.1.2)

    # But we can't count on all servers to have this configuration.
    @password == nil || @password == ''
  end

  def password_correct?
    ENV.fetch('MOCK_LDAP_PASSWORD') == @password
  end
end
