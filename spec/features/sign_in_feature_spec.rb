require 'rails_helper'
require 'capybara/rspec'

describe "Sign In Flow", :type => :feature do

  context "educator with account signs in" do

    it "can access students page" do
      educator = FactoryGirl.create(:educator)
      visit root_url
      click_link 'Sign In'
      fill_in 'educator_email', with: educator.email
      fill_in 'educator_password', with: educator.password
      click_button 'Log in'

      expect(page).to have_content 'Signed in successfully.'
      visit "/students"
      expect(current_path).to eq("/students")
    end

  end

  context "educator without account signs in" do

    it "cannot access students page" do
      visit root_url
      click_link 'Sign In'
      fill_in 'educator_email', with: "educatorname"
      fill_in 'educator_password', with: "password"
      click_button 'Log in'

      expect(page).to have_content 'Invalid email or password.'
      visit "/students"
      expect(current_path).not_to eq("/students")
    end 

  end

end
