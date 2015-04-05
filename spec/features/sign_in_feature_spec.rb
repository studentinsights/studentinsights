require 'rails_helper'
require 'capybara/rspec'

describe "Sign In Flow", :type => :feature do

  context "user with account signs in" do

    it "can access students page" do
      user = FactoryGirl.create(:user)
      visit root_url
      click_link 'Sign In'
      fill_in 'user_email', with: user.email
      fill_in 'user_password', with: user.password
      click_button 'Log in'

      expect(page).to have_content 'Signed in successfully.'
      visit "/students"
      expect(current_path).to eq("/students")
    end

  end

  context "user without account signs in" do

    it "cannot access students page" do
      visit root_url
      click_link 'Sign In'
      fill_in 'user_email', with: "username"
      fill_in 'user_password', with: "password"
      click_button 'Log in'

      expect(page).to have_content 'Invalid email or password.'
      visit "/students"
      expect(current_path).not_to eq("/students")
    end 

  end

end
