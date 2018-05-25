require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in using database_authenticatable not LDAP', type: :feature do
  let!(:pals) { TestPals.create! }

  context 'teacher signs in' do
    def expect_successful_sign_in_for(educator)
      educator_sign_in(educator)
      expect(page).to have_content 'Search for student:'
    end

    it { expect_successful_sign_in_for(pals.healey_sarah_teacher) }
    it { expect_successful_sign_in_for(pals.uri) }
    it { expect_successful_sign_in_for(pals.west_marcus_teacher) }
  end

  context 'person without authorization attempts to sign in' do
    it 'cannot access students page' do
      sign_in_attempt('educatorname', 'password')
      expect(page).to have_content 'Invalid Email or password.'
    end
  end
end
