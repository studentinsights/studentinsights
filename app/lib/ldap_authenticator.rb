class LDAPAuthenticator
  def initialize(options = {})
    @logger = options.fetch(:logger, Rails.logger)
    @ldap_class = options.fetch(:ldap_class, MockLDAP.should_use? ? MockLDAP : Net::LDAP)
  end

  # Create a Net::LDAP instance, `bind` to it and close.
  # Return true or false if they're authorized.
  def is_authorized_by_ldap?(ldap_login, ldap_password)
    # Guard for bad calls
    if ldap_login.nil? || ldap_login == ''
      @logger.error 'LDAPAuthenticator#is_authorized_by_ldap? aborting because of empty login.'
      return false
    end
    if ldap_password.nil? || ldap_password == ''
      @logger.error 'LDAPAuthenticator#is_authorized_by_ldap? aborting because of empty password.'
      return false
    end

    # Perform bind
    options = ldap_options_for(ldap_login, ldap_password)
    ldap = @ldap_class.new(options)
    is_authorized = ldap.bind

    if !is_authorized
      ldap_error = ldap.get_operation_result
      @logger.error "LDAPAuthenticator, ldap_error from get_operation_result: #{ldap_error}"
    end

    is_authorized
  end

  private
  # Read config and create options for a Net::LDAP instance
  # that can bind to `(ldap_login, ldap_password)`
  def ldap_options_for(ldap_login, ldap_password)
    host = ENV['DISTRICT_LDAP_HOST']
    port = ENV['DISTRICT_LDAP_PORT'].to_i
    encryption_tls_options = JSON.parse(ENV['DISTRICT_LDAP_ENCRYPTION_TLS_OPTIONS_JSON'] || '{}').deep_symbolize_keys

    {
      host: host,
      port: port,
      connect_timeout: ENV.fetch('DISTRICT_LDAP_TIMEOUT_IN_SECONDS', '30').to_i,
      auth: {
        :method => :simple,
        :username => ldap_login,
        :password => ldap_password,
      },
      encryption: {
        method: :simple_tls,
        tls_options: encryption_tls_options
      }
    }
  end
end
