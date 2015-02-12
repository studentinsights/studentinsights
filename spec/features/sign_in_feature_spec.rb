require 'rails_helper'
require 'capybara/rspec'

describe "Sign In Flow", :type => :feature do

  context "user with account signs in" do

    it "allows user to access index page" do

      user = FactoryGirl.create(:user)
      visit root_url
      click_link 'Sign In'
      fill_in 'Email', :with => user.email
      fill_in 'Password', :with => user.password
      click_button 'Log in'
      expect(page).to have_content 'Signed in successfully.'
      
    end

  end

  context "user without account attempts to sign in" do

    it "denies user to access index page" do

      visit root_url
      click_link 'Sign In'
      fill_in 'Email', :with => "nogood@gmail.com"
      fill_in 'Password', :with => "nogood"
      click_button 'Log in'
      expect(page).not_to have_content 'Signed in successfully.'
      
    end

  end

end
