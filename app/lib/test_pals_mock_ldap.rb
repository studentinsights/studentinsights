class TestPalsMockLDAP

  def initialize(options)
    @options = options
    @email = options[:auth][:username]
    @password = options[:auth][:password]
  end

  def bind
    raise 'LDAP error' unless ::EnvironmentVariable.is_true('USE_TEST_PALS_LDAP')

    return false unless email_present?

    return true if unauthenticated_bind?

    return false unless password_correct?

    return true
  end

  def get_operation_result
  end

  private

  def email_present?
    Educator.find_by_email(@email).present?
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
    ENV.fetch('TEST_PALS_LDAP_PASSWORD') == @password
  end
end
