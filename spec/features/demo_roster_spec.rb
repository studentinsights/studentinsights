require 'rails_helper'
require 'capybara/rspec'

describe "demo roster flow", :type => :feature do

  context "user without account visits demo roster" do

    it "can access demo roster" do
      visit root_url
      click_link "Roster Demo"
      expect(current_path).to eq("/demo")
    end

    it "can see risk categories" do
      visit root_url
      click_link "Roster Demo"
      expect(page).to have_content 'High Risk'
      expect(page).to have_content 'Low Risk'
      expect(page).to have_content 'Medium Risk'
    end

  end

end