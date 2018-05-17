class TestPalsMockLDAP

  def initialize(options)
    @options = options
    @email = options[:auth][:username]
    @password = options[:auth][:password]
  end

  def bind
    raise 'LDAP error' unless ::EnvironmentVariable.is_true('USE_TEST_PALS_LDAP')

    return false unless email_present?

    return false unless password_correct?

    return true
  end

  def get_operation_result
  end

  private

  def email_present?
    Educator.find_by_email(@email).present?
  end

  def password_correct?
    ENV.fetch('TEST_PALS_LDAP_PASSWORD') == @password
  end
end