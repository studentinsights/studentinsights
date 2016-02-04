require 'ostruct'

module LdapHelpers
  # Mock LDAP to authenticate test educator
  def mock_ldap_authorization
    fake_ldap = OpenStruct.new(authorized?: true)
    allow(Devise::LDAP::Connection).to receive(:new).and_return(fake_ldap)
  end

  # Mock LDAP response rejecting test educator authentication
  def mock_ldap_rejection
    fake_ldap = OpenStruct.new(authorized?: false)
    allow(Devise::LDAP::Connection).to receive(:new).and_return(fake_ldap)
  end
end

RSpec.configure do |config|
  config.include LdapHelpers
end
