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
        email = authentication_hash[:email]
        begin
          educator = Educator.find_by_email(email.downcase)
          fail!(:not_found_in_database) and return unless educator.present?
          fail!(:invalid) and return unless is_authorized_by_ldap?(email, password)
          success!(educator) and return
        rescue => error
          logger.error "LdapAuthenticatableTiny, error: #{error}"
          fail!(:error) and return
        end
        nil
      end

      private
      # Create a Net::LDAP instance, `bind` to it and close.
      # Return true or false if they're authorized.
      def is_authorized_by_ldap?(login, password)
        return false if password.nil? || password == ''
        options = ldap_options_for(login, password)
        ldap = Net::LDAP.new(options)
        is_authorized = ldap.bind

        if !is_authorized
          ldap_error = ldap.get_operation_result
          logger.error "LdapAuthenticatableTiny, ldap_error: #{ldap_error}"
        end

        is_authorized
      end

      # Read config and create options for a Net::LDAP instance
      # that can bind to `(email,password)`
      def ldap_options_for(email, password)
        host = ENV['DISTRICT_LDAP_HOST']
        port = ENV['DISTRICT_LDAP_PORT'].to_i
        encryption_tls_options = JSON.parse(ENV['DISTRICT_LDAP_ENCRYPTION_TLS_OPTIONS_JSON'] || '{}').deep_symbolize_keys

        {
          host: host,
          port: port,
          auth: {
            :method => :simple,
            :username => email,
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
