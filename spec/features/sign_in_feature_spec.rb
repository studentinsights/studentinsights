require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in using Mock LDAP', type: :feature do
  def expect_successful_sign_in_for(educator)
    sign_in_attempt(educator.email, 'demo-password')
    expect(page).to have_content 'Search:'
  end

  context 'somerville' do
    let!(:pals) { TestPals.create! }

    it { expect_successful_sign_in_for(pals.healey_sarah_teacher) }
    it { expect_successful_sign_in_for(pals.uri) }
    it { expect_successful_sign_in_for(pals.west_marcus_teacher) }

    context 'person without authorization attempts to sign in' do
      it 'cannot access students page' do
        sign_in_attempt('educatorname', 'password')
        expect(page).to have_content 'Invalid Login name or password.'
      end
    end
  end

  context 'somerville' do
    let!(:pals) { BedfordTestPals.create! }

    it { expect_successful_sign_in_for(pals.donna) }

    context 'person without authorization attempts to sign in' do
      it 'cannot access students page' do
        sign_in_attempt('educatorname', 'password')
        expect(page).to have_content 'Invalid Login name or password.'
      end
    end
  end
end
