module Devise
  module Strategies
    class LdapAuthenticatableTiny < Authenticatable
      # Check that we have that user in the database, then check
      # credentials against LDAP, and return success if both succeed.
      # This method ultimately calls `fail` or `success!`
      #
      # `authentication_hash` and `password` methods are provided by the superclass:
      # https://github.com/plataformatec/devise/blob/master/lib/devise/strategies/authenticatable.rb
      #
      # Also check out Devise's Authenticable Model and Warden's base Strategy to
      # see what's going on here.
      # https://github.com/wardencommunity/warden/blob/master/lib/warden/strategies/base.rb#L8
      # https://github.com/plataformatec/devise/blob/master/lib/devise/models/authenticatable.rb
      def authenticate!
        login_username = authentication_hash.fetch(:login_name)  # For some districts, this will be an email
        ldap_class = ShouldUseMockLDAP.new.check ? MockLDAP : Net::LDAP

        begin
          educator = PerDistrict.new.find_educator_from_login_text(login_username)
          fail!(:not_found_in_database) and return unless educator.present?
          fail!(:invalid) and return unless is_authorized_by_ldap?(ldap_class, login_username, password)
          success!(educator) and return
        rescue => error
          Rollbar.error('LdapAuthenticatableTiny error caught', error)
          logger.error "LdapAuthenticatableTiny, error caught: #{error}"
          fail!(:error) and return
        end
        nil
      end

      private
      # Create a Net::LDAP instance, `bind` to it and close.
      # Return true or false if they're authorized.
      def is_authorized_by_ldap?(ldap_class, login_username, password)
        return false if password.nil? || password == ''
        options = ldap_options_for(login_username, password)
        ldap = ldap_class.new(options)
        is_authorized = ldap.bind

        if !is_authorized
          ldap_error = ldap.get_operation_result
          logger.error "LdapAuthenticatableTiny, ldap_error from get_operation_result: #{ldap_error}"
        end

        is_authorized
      end

      # Read config and create options for a Net::LDAP instance
      # that can bind to `(login_username,password)`
      def ldap_options_for(login_username, password)
        host = ENV['DISTRICT_LDAP_HOST']
        port = ENV['DISTRICT_LDAP_PORT'].to_i
        encryption_tls_options = JSON.parse(ENV['DISTRICT_LDAP_ENCRYPTION_TLS_OPTIONS_JSON'] || '{}').deep_symbolize_keys

        {
          host: host,
          port: port,
          connect_timeout: ENV.fetch('DISTRICT_LDAP_TIMEOUT_IN_SECONDS', '30').to_i,
          auth: {
            :method => :simple,
            :username => login_username,
            :password => password,
          },
          encryption: {
            method: :simple_tls,
            tls_options: encryption_tls_options
          }
        }
      end

      def logger
        Rails.logger
      end
    end
  end
end
