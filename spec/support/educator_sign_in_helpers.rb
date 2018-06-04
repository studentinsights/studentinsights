# Shared method between feature tests for educator sign in
def sign_in_attempt(email, password)
  visit root_url
  fill_in 'educator_email', with: email
  fill_in 'educator_password', with: password
  click_button 'Log in'
end
