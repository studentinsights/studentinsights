require 'devise/strategies/authenticatable'
module Devise
  module Models
    module LdapAuthenticatableTiny
      # Because Devise's session_controller#new
      # takes the authentication params and passes them along, we
      # get the user's password here.  So we need to implement
      # a method to handle this, but We only want to
      # pass this along to the LDAP request so we
      # don't persist the password anywhere even in memory.
      def password=(new_password) end
    end
  end
end
