require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in', type: :feature do

  context 'educator with LDAP authorization signs in' do
    let!(:admin_educator) {
      FactoryGirl.create(:educator, :admin, full_name: 'Educator, Example')
    }

    it 'signs in' do
      educator_sign_in(admin_educator)
      visit admin_root_url
      expect(page).to have_content 'Educator, Example'
    end
  end

end
