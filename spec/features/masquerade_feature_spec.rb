require 'rails_helper'
require 'capybara/rspec'

describe 'masquerading, testing only in Somerville', type: :feature do
  let!(:pals) { TestPals.create! }

  before(:each) { LoginTests.reset_rack_attack! }
  before(:each) { LoginTests.before_disable_consistent_timing! }
  after(:each) { LoginTests.after_reenable_consistent_timing! }

  def expect_to_allow_masquerading(page)
    expect(page).not_to have_css('.Masquerade-is-masquerading-warning')
    expect(page).to have_content('Sign Out')
    expect(page).to have_css('.NavbarSignedIn-masquerade-link-to-become-page')
    expect(page).not_to have_css('.NavbarSignedIn-clear-masquerade')
  end

  def expect_to_be_masquerading_as(page, educator)
    expect(page).to have_css('.Masquerade-is-masquerading-warning')
    expect(page).to have_content('Sign Out')
    expect(page).to have_content("#{educator.email.split('@')[0]}@")
    expect(page).to have_css('.NavbarSignedIn-clear-masquerade')
  end

  def expect_not_to_be_masquerading(page)
    expect(page).not_to have_css('.Masquerade-is-masquerading-warning')
    expect(current_path).to eq('/not_authorized')
    expect(page).to have_content('Sign Out')
    expect(page).not_to have_css('.NavbarSignedIn-masquerade-link-to-become-page')
    expect(page).not_to have_css('.NavbarSignedIn-clear-masquerade')
  end

  def expect_to_be_logged_out(page)
    expect(current_path).to eq('/')
    expect(page).to have_content('Login')
    expect(page).to have_content('Password')
    expect(page).to have_css('.SignInPage')
    expect(page).not_to have_content('Sign Out')
  end

  def expect_masquerading_to_fail(educator)
    feature_sign_in(educator)
    simulate_clicking_become_link(page, pals.uri.id)
    expect_not_to_be_masquerading(page)
  end

  # This is all a manual workaround for not being able to click on links that use
  # jquery_ujs in RackTest (there's no JS running to interpret the click and translate it
  # into a post request).  If we just used `visit` directly, it'd make a get request and
  # not work.
  #
  # This doesn't actually test the content of the link on the page.
  def simulate_clicking_become_link(page, target_educator_email)
    page.driver.post admin_masquerade_become_url(masquerading_educator_id: pals.shs_jodi.id)

    # I'm not sure why, but everything to this point has been http, and this
    # redirects to https.  Also not sure why Capybara doesn't follow this (perhaps
    # because we're manually make posting requests to RackTest.  Either way,
    # this manually follows the redirect and makes another post to the same path at https.
    page.driver.post page.driver.response.location

    # And one more time we manually follow the expected redirect (in this case it's back to
    # the home page).
    visit page.driver.response.location
  end

  it 'works for Uri to become another user' do
    feature_sign_in(pals.uri)
    expect_to_allow_masquerading(page)
    simulate_clicking_become_link(page, pals.shs_jodi.id)
    expect_to_be_masquerading_as(page, pals.shs_jodi)
  end

  it 'does not work for Jodi to become another user' do
    feature_sign_in(pals.shs_jodi)
    simulate_clicking_become_link(page, pals.uri.id)
    expect_not_to_be_masquerading(page)
    feature_sign_out
    expect_to_be_logged_out(page)
  end

  it 'does not work for any other users to masquerade as Uri or anyone else' do
    (Educator.all - [pals.uri]).each do |educator|
      LoginTests.reset_rack_attack! # sidestep repeated login throttling

      # We test trying to masquerade as Uri, and as one other user we sample
      # (none of these should work, and we sample since it's slow to test every
      # possible permutation).
      ([pals.uri] + Educator.all.sample(1)).each do |target|
        feature_sign_in(educator, multifactor_cheating: true)
        simulate_clicking_become_link(page, target.id)
        expect_not_to_be_masquerading(page)
        feature_sign_out
        expect_to_be_logged_out(page)
        print('✓') # a nice progress indicator since these are slower tests
      end
    end
  end
end
