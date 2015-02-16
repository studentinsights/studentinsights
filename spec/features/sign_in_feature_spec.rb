require 'rails_helper'
require 'capybara/rspec'

describe "Sign In Flow", :type => :feature do

  context "user with account asks for PIN" do

    def request_pin
      user = FactoryGirl.create(:user)
      visit root_url
      click_link 'Sign In'
      fill_in 'user_email', with: user.email
      click_button 'Send PIN'
      return user
    end

    it "proceeds to sign in page" do
      request_pin
      expect(page).to have_content 'PIN sent via SMS.'
    end

    it "signs in with PIN and can access data page" do
      user = request_pin
      fill_in 'user_otp_attempt', with: user.current_otp
      fill_in 'user_email', with: user.email
      fill_in 'user_password', with: user.password
      click_button 'Log in'
      expect(page).to have_content 'Signed in successfully.'
      visit "/students"
      expect(current_path).to eq("/students")
    end

  end

  context "user without account asks for PIN" do

    def request_pin_without_account
      visit root_url
      click_link 'Sign In'
      fill_in 'user_email', with: "nogood@gmail.com"
      click_button 'Send PIN'
    end

    it "redirects to get PIN page" do
      request_pin_without_account
      expect(page).to have_content 'No user found with that email.'
    end

    it "cannot access data page" do
      request_pin_without_account
      visit "/students"
      expect(current_path).not_to eq("/students")
    end 

  end

end
