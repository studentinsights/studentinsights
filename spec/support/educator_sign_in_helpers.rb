# Mock LDAP to authenticate test educator
def mock_ldap_authorization
  allow_any_instance_of(Devise::LDAP::Connection).to receive(:initialize).and_return('okay!')
  allow_any_instance_of(Devise::LDAP::Connection).to receive(:authorized?).and_return(true)
end

# Mock LDAP response rejecting test educator authentication
def mock_ldap_rejection
  allow_any_instance_of(Devise::LDAP::Connection).to receive(:initialize).and_return('okay!')
  allow_any_instance_of(Devise::LDAP::Connection).to receive(:authorized?).and_return(false)
end

# Shared method between feature tests for educator sign in
def educator_sign_in(educator)
  visit root_url
  click_link 'Sign In'
  fill_in 'educator_email', with: educator.email
  fill_in 'educator_password', with: educator.password
  click_button 'Log in'
end
