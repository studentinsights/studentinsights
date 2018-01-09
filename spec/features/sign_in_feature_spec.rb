require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in', type: :feature do
  let!(:pals) { TestPals.create! }

  context 'teacher signs in' do
    def expect_successful_sign_in_for(educator)
      mock_ldap_authorization
      educator_sign_in(educator)
      expect(page).to have_content 'Signed in successfully.'
    end

    it { expect_successful_sign_in_for(pals.healey_sarah_teacher) }
    it { expect_successful_sign_in_for(pals.uri) }
    it { expect_successful_sign_in_for(pals.west_marcus_teacher) }

    context 'without default page' do
      let(:educator) { pals.shs_jodi }
      it 'redirects to no default page' do
        mock_ldap_authorization
        educator_sign_in(educator)
        expect(page).to have_content 'problem with your account'
      end
    end
  end

  context 'person without LDAP authorization attempts to sign in' do
    it 'cannot access students page' do
      mock_ldap_rejection
      sign_in_attempt('educatorname', 'password')
      expect(page).to have_content 'Invalid Email or password.'
    end
  end
end
