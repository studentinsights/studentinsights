class TestPalsMockLDAP

  TEST_PAL_NAMES = %w[
    uri
    rich
    vivian
    alonso
    silva
    laura
    sarah
    marcus
    sofia
    jodi
    bill
    hugo
    fatima
  ]

  TEST_PAL_EMAILS = TEST_PAL_NAMES.map { |n| "#{n}@demo.studentinsights.org" }

  def initialize(options)
    @options = options
    @email = options[:auth][:username]
    @password = options[:auth][:password]
  end

  def bind
    raise 'LDAP error' unless ::EnvironmentVariable.is_true('USE_TEST_PALS_LDAP')

    return TEST_PAL_EMAILS.include?(@email) && @password == 'demo-password'
  end

  def get_operation_result
  end
end