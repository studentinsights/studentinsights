require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in using Mock LDAP', type: :feature do
  context 'bedford' do
    let!(:pals) { BedfordTestPals.create! }

    def expect_successful_sign_in_for(educator)
      sign_in_attempt(educator.email, 'demo-password', 'educator_login_name')
      expect(page).to have_content 'Search:'
    end

    before do
      stub_const('ENV', ENV.to_hash.merge('DISTRICT_KEY' => 'bedford'))
    end

    it { expect_successful_sign_in_for(pals.donna) }

    context 'person without authorization attempts to sign in' do
      it 'cannot access students page' do
        sign_in_attempt('educatorname', 'password', 'educator_login_name')
        expect(page).to have_content 'Invalid Email or password.'
      end
    end
  end
end