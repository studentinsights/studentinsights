# Shared method between feature tests for educator sign in
def educator_sign_in(educator)
  sign_in_attempt(educator.email, educator.password)
end

def sign_in_attempt(email, password)
  visit root_url
  click_link 'Sign In'
  fill_in 'educator_email', with: email
  fill_in 'educator_password', with: password
  click_button 'Log in'
end
