# This is a mixin becasue I couldn't get it to be able to call `allow` as a standalone class.
module FeatureHelpers
  # Sign in by either standard or MFA methods
  def feature_sign_in(educator, options = {})
    authenticator = MultifactorAuthenticator.new(educator)
    if !authenticator.is_multifactor_enabled?
      feature_plain_sign_in(educator.email, 'demo-password')
    elsif options[:multifactor_cheating]
      feature_multifactor_sign_in_by_cheating(educator)
    else
      feature_multifactor_sign_in_by_peeking(educator)
    end
  end

  # Sign in via multifactor (by peeking at correct code, which means that it can
  # only be used once).
  def feature_multifactor_sign_in_by_peeking(educator, options = {})
    login_text = options.fetch(:login_text, educator.email)
    login_code = LoginTests.peek_at_correct_multifactor_code(educator)
    feature_plain_sign_in(login_text, 'demo-password', login_code: login_code)
  end

  # Sign in via multifactor by mocking out the check.  This lets tests
  # run more quickly and do repeated logins.
  def feature_multifactor_sign_in_by_cheating(educator)
    fake_authenticator = MultifactorAuthenticator.new(educator)
    allow(MultifactorAuthenticator).to receive(:new).and_return(fake_authenticator)
    expect(fake_authenticator).to receive(:is_multifactor_code_valid?).with('555123').and_return(true)

    feature_plain_sign_in(educator.email, 'demo-password', login_code: '555123')
  end

  # Plan text fields, without MFA code
  def feature_plain_sign_in(login, password, options = {})
    visit '/'
    fill_in 'educator_login_text', with: login
    fill_in 'educator_password', with: password
    if options[:login_code]
      fill_in 'educator_login_code', with: options[:login_code]
    end
    click_button 'Log in'
  end

  # Submit the form to ask for a login code via SMS
  def feature_request_multifactor(login_text)
    visit '/'
    fill_in 'multifactor_login_text', with: login_text
    click_button 'Send code'
  end

  # This makes the sign out requests manually, since it's a delete request
  # and would require jquery_ujs and a JavaScript driver.  This involves
  # manually following two redirects - one to HTTPS (not sure why) and the
  # other to follow the real redirection after signing out back to the root url.
  #
  # This doesn't actually test the Sign Out link on the page.
  def feature_sign_out
    # Make a delete request
    page.driver.delete Rails.application.routes.url_helpers.destroy_educator_session_path

    # Follow https, make same delete request.
    page.driver.delete page.driver.response.location

    # Follow redirection back to root.
    page.visit page.driver.response.location
  end

  # The first sign in during the test run can take ~2500ms, so
  # For any specs that are testing timing, do a "warm up" before
  # measuring timing for reals (eg https://travis-ci.org/studentinsights/studentinsights/builds/458182204#L2665)
  def feature_timing_warm_up!(educator)
    feature_sign_in(educator)
    feature_reset_login_attempt!
  end

  # For timing specs that sign in and out repeatedly in the same test example
  def feature_reset_login_attempt!
    Rack::Attack.cache.store.clear
    page.reset!
  end
end
