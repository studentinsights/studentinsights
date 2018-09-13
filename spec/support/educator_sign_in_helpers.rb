# Shared method between feature tests for educator sign in
def sign_in_attempt(login_username, password, login_username_field_id = 'educator_email')
  visit root_url
  fill_in login_username_field_id, with: login_username
  fill_in 'educator_password', with: password
  click_button 'Log in'
end

# This makes the sign out requests manually, since it's a delete request
# and woudl require jquery_ujs and a JavaScript driver.  This involves
# manually following two redirects - one to HTTPS (not sure why) and the
# other to follow the real redirection after signing out back to the root url.
#
# This doesn't actually test the Sign Out link on the page.
def sign_out
  # Make a delete request
  page.driver.delete destroy_educator_session_path

  # Follow https, make same delete request.
  page.driver.delete page.driver.response.location

  # Follow redirection back to root.
  page.visit page.driver.response.location
end
