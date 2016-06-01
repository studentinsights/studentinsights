require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in', type: :feature do

  context 'educator with LDAP authorization signs in' do

    context 'with homeroom' do
      let(:school) { FactoryGirl.create(:school) }
      let(:homeroom) { FactoryGirl.create(:homeroom, school: school) }
      let(:educator) { FactoryGirl.create(:educator, homeroom: homeroom, school: school) }

      it 'signs in' do
        mock_ldap_authorization
        educator_sign_in(educator)
        expect(page).to have_content 'Signed in successfully.'
      end
    end

    context 'without homeroom' do
      let(:educator) { FactoryGirl.create(:educator) }

      context 'homerooms exist' do
        let!(:homeroom) { FactoryGirl.create(:homeroom) }
        it 'redirects to no-homeroom error page' do
          mock_ldap_authorization
          educator_sign_in(educator)
          expect(page).to have_content 'Looks like there\'s no homeroom assigned to you.'
        end
      end

      context 'no homerooms exist' do
        it 'redirects to no homerooms page' do
          mock_ldap_authorization
          educator_sign_in(educator)
          expect(page).to have_content 'Looks like there are no homerooms.'
        end
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
