require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in using Mock LDAP', type: :feature do
  let!(:pals) { TestPals.create! }

  context 'teacher signs in' do
    def expect_successful_sign_in_for(educator)
      sign_in_attempt(educator.email, 'demo-password')
      expect(page).to have_content 'Search:'
    end

    it { expect_successful_sign_in_for(pals.healey_sarah_teacher) }
    it { expect_successful_sign_in_for(pals.uri) }
    it { expect_successful_sign_in_for(pals.west_marcus_teacher) }
  end

  context 'person without authorization attempts to sign in' do
    it 'cannot access students page' do
      sign_in_attempt('educatorname', 'password')
      expect(page).to have_content 'Invalid login or password.'
    end
  end
end

describe 'with Mock LDAP, integration tests work across districts' do
  it 'works for Somerville using email' do
    TestPals.create!(email_domain: 'k12.somerville.ma.us')
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::SOMERVILLE))
    sign_in_attempt('uri@k12.somerville.ma.us', 'demo-password')
    expect(page).to have_content 'Search:'
  end

  it 'works for New Bedford using email' do
    TestPals.create!(email_domain: 'newbedfordschools.org')
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::NEW_BEDFORD))
    sign_in_attempt('uri@newbedfordschools.org', 'demo-password')
    expect(page).to have_content 'Search:'
  end

  it 'works for Bedford using plain login_name, and separate email address for LDAP authentication' do
    TestPals.create!(email_domain: 'bedfordps.org')
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))
    sign_in_attempt('uri', 'demo-password')
    expect(page).to have_content 'Search:'
  end

  it 'works for demo' do
    TestPals.create!
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::DEMO))
    sign_in_attempt('uri@demo.studentinsights.org', 'demo-password')
    expect(page).to have_content 'Search:'
  end
end
