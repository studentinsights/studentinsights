# require "#{Rails.root}/app/lib/ldap_authenticatable_tiny/strategies";
# require "#{Rails.root}/app/lib/ldap_authenticatable_tiny/models";

# This sets up a new Devise module for authenticating with an LDAP bind call.
puts '<<< before <<<'
Warden::Strategies.add(:ldap_authenticatable_tiny, Devise::Strategies::LDAPAuthenticatableTiny)
puts '<<< next <<<'
Devise.add_module(:ldap_authenticatable_tiny, {
  :strategy  => true,
  :route => :session,
  :controller => :sessions
  # :model  => "#{Rails.root}/app/lib/ldap_authenticatable_tiny"
})
puts '<<< after <<<'