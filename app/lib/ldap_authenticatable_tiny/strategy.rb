module Devise
  module Strategies
    class LdapAuthenticatableTiny < Authenticatable
      # This is the entry point, and we wrap it to prevent timing attacks
      # that could result from the different execution times of the different
      # code paths.
      def authenticate!
        desired_milliseconds = parse_desired_milliseconds
        ConsistentTiming.new.enforce_timing(desired_milliseconds) do
          authenticate_with_variable_timing!
        end
      end

      private
      def parse_desired_milliseconds
        default_value_in_milliseconds = 10000
        desired_milliseconds = ENV.fetch('CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS', default_value_in_milliseconds.to_s).to_i
        return default_value_in_milliseconds if desired_milliseconds == 0
        desired_milliseconds
      end

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
      def authenticate_with_variable_timing!
        login_text = authentication_hash[:login_text].downcase.strip
        ldap_class = MockLDAP.should_use? ? MockLDAP : Net::LDAP

        begin
          # First, see if we can find an Educator record
          educator = PerDistrict.new.find_educator_by_login_text(login_text)
          fail!(:not_found_in_database) and return unless educator.present?

          # Next, try asking the LDAP server if they have access
          ldap_login = PerDistrict.new.ldap_login_for_educator(educator)
          fail!(:invalid) and return unless is_authorized_by_ldap?(ldap_class, ldap_login, password)
          success!(educator) and return
        rescue => error
          Rollbar.error('LdapAuthenticatableTiny error caught', error)
          logger.error "LdapAuthenticatableTiny, error caught: #{error}"
          fail!(:error) and return
        end
        nil
      end

      # Create a Net::LDAP instance, `bind` to it and close.
      # Return true or false if they're authorized.
      def is_authorized_by_ldap?(ldap_class, login, password)
        return false if password.nil? || password == ''
        options = ldap_options_for(login, password)
        ldap = ldap_class.new(options)
        is_authorized = ldap.bind

        if !is_authorized
          ldap_error = ldap.get_operation_result
          if should_log_ldap_error?(ldap_error)
            Rollbar.error("LdapAuthenticatableTiny, ldap_error from get_operation_result: #{ldap_error}")
            logger.error "LdapAuthenticatableTiny, ldap_error from get_operation_result: #{ldap_error}"
          end
        end

        is_authorized
      end

      def should_log_ldap_error?(ldap_error)
        return false if ldap_error.code == 49 && ldap_error.error_message.includes?('comment: AcceptSecurityContext error, data 52e') # normal authentication failure because of invalid credentials
        true
      end

      # Read config and create options for a Net::LDAP instance
      # that can bind to `(login, password)`
      def ldap_options_for(login, password)
        host = ENV['DISTRICT_LDAP_HOST']
        port = ENV['DISTRICT_LDAP_PORT'].to_i
        encryption_tls_options = JSON.parse(ENV['DISTRICT_LDAP_ENCRYPTION_TLS_OPTIONS_JSON'] || '{}').deep_symbolize_keys

        {
          host: host,
          port: port,
          connect_timeout: ENV.fetch('DISTRICT_LDAP_TIMEOUT_IN_SECONDS', '30').to_i,
          auth: {
            :method => :simple,
            :username => login,
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
