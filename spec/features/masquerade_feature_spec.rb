require 'rails_helper'
require 'capybara/rspec'

describe 'masquerading', type: :feature do
  let!(:pals) { TestPals.create! }

  def sign_in_as(educator)
    sign_in_attempt(educator.email, 'demo-password')
  end

  def expect_to_be_masquerading_as(page, educator)
    expect(page).to have_content('Sign Out')
    expect(page).to have_content(educator.email.split('@')[0])
    expect(page).to have_css('.nav-options-is-masquerading')
    expect(page).to have_css('.nav-options-masquerading-user')
    expect(page).to have_css('.nav-options-clear-masquerade')
  end

  def expect_not_to_be_masquerading(page)
    expect(current_path).to eq('/not_authorized')
    expect(page).to have_content('Sign Out')
    expect(page).not_to have_css('.nav-options-is-masquerading')
    expect(page).not_to have_css('.nav-options-masquerading-user')
    expect(page).not_to have_css('.nav-options-clear-masquerade')
  end

  def expect_to_be_logged_out(page)
    expect(current_path).to eq('/')
    expect(page).to have_content('Email')
    expect(page).to have_content('Password')
    expect(page).to have_css('.sign-in-container')
    expect(page).not_to have_content('Sign Out')
  end

  def expect_masquerading_to_fail(educator)
    sign_in_as(educator)
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

  it 'works for Uri to become any user' do
    sign_in_as(pals.uri)
    simulate_clicking_become_link(page, pals.shs_jodi.id)
    expect_to_be_masquerading_as(page, pals.shs_jodi)
  end

  it 'does not work for Jodi to become any user' do
    sign_in_as(pals.shs_jodi)
    simulate_clicking_become_link(page, pals.uri.id)
    expect_not_to_be_masquerading(page)
    sign_out
    expect_to_be_logged_out(page)
  end

  describe 'blocks all other TestPals' do
    it 'rich_districtwide' do expect_masquerading_to_fail(pals.rich_districtwide) end
    it 'healey_vivian_teacher' do expect_masquerading_to_fail(pals.healey_vivian_teacher) end
    it 'healey_ell_teacher' do expect_masquerading_to_fail(pals.healey_ell_teacher) end
    it 'healey_sped_teacher' do expect_masquerading_to_fail(pals.healey_sped_teacher) end
    it 'healey_laura_principal' do expect_masquerading_to_fail(pals.healey_laura_principal) end
    it 'healey_sarah_teacher' do expect_masquerading_to_fail(pals.healey_sarah_teacher) end
    it 'west_marcus_teacher' do expect_masquerading_to_fail(pals.west_marcus_teacher) end
    it 'shs_jodi' do expect_masquerading_to_fail(pals.shs_jodi) end
    it 'shs_bill_nye' do expect_masquerading_to_fail(pals.shs_bill_nye) end
    it 'shs_ninth_grade_counselor' do expect_masquerading_to_fail(pals.shs_ninth_grade_counselor) end
    it 'shs_hugo_art_teacher' do expect_masquerading_to_fail(pals.shs_hugo_art_teacher) end
    it 'shs_fatima_science_teacher' do expect_masquerading_to_fail(pals.shs_fatima_science_teacher) end
  end

  # it 'does not work for any other users to masquerade as anyone else' do
  #   (Educator.all - [pals.uri]).each do |educator|
  #     Educator.all.each do |target|
  #       sign_in_as(educator)
  #       simulate_clicking_become_link(page, target.id)
  #       expect_not_to_be_masquerading(page)
  #       sign_out
  #       expect_to_be_logged_out(page)
  #     end
  #   end
  # end
end
