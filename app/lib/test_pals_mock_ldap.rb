class TestPalsMockLDAP

  def initialize(options)
    @options = options
    @email = options[:auth][:username]
    @password = options[:auth][:password]
  end

  def bind
    raise 'LDAP error' unless ::EnvironmentVariable.is_true('USE_TEST_PALS_LDAP')

    return Educator.find_by_email(@email).present? && @password == 'demo-password'
  end

  def get_operation_result
  end
end