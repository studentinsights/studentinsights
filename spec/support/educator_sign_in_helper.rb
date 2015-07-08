# Shared method between feature tests for educator sign in

def educator_sign_in(educator)
  visit root_url
  click_link 'Sign In'
  fill_in 'educator_email', with: educator.email
  fill_in 'educator_password', with: educator.password
  click_button 'Log in'
end
