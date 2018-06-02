require 'rails_helper'
require 'capybara/rspec'

describe 'masquerading', type: :feature do
  let!(:pals) { TestPals.create! }


  it 'works' do
    educator = pals.uri
    puts "  current_path: #{current_path}"
    sign_in_attempt(educator.email, 'demo-password')
    puts "  current_path: #{current_path}"
    visit admin_authorization_url
    puts "  current_path: #{current_path}"

    # manual workaround for RackTest (no JS to do the post)
    # first(:css, '.become-link').click
    page.driver.post first(:css, '.become-link')['href']
    puts "  current_path: #{current_path}"
    visit page.driver.response.location

    puts "  current_path: #{current_path}"
    puts page.html
    puts first(:css, '.nav').html

    # checks << true if page.has_content?('Educator permissions: Overview')
    # checks.any?
  end

  # it 'works for Uri' do expect(grants_access?(pals.uri)).to eq true end

  # describe 'blocks all other TestPals' do
  #   it 'rich_districtwide' do expect(grants_access?(pals.rich_districtwide)).to eq false end
  #   it 'healey_vivian_teacher' do expect(grants_access?(pals.healey_vivian_teacher)).to eq false end
  #   it 'healey_ell_teacher' do expect(grants_access?(pals.healey_ell_teacher)).to eq false end
  #   it 'healey_sped_teacher' do expect(grants_access?(pals.healey_sped_teacher)).to eq false end
  #   it 'healey_laura_principal' do expect(grants_access?(pals.healey_laura_principal)).to eq false end
  #   it 'healey_sarah_teacher' do expect(grants_access?(pals.healey_sarah_teacher)).to eq false end
  #   it 'west_marcus_teacher' do expect(grants_access?(pals.west_marcus_teacher)).to eq false end
  #   it 'shs_jodi' do expect(grants_access?(pals.shs_jodi)).to eq false end
  #   it 'shs_bill_nye' do expect(grants_access?(pals.shs_bill_nye)).to eq false end
  #   it 'shs_ninth_grade_counselor' do expect(grants_access?(pals.shs_ninth_grade_counselor)).to eq false end
  #   it 'shs_hugo_art_teacher' do expect(grants_access?(pals.shs_hugo_art_teacher)).to eq false end
  #   it 'shs_fatima_science_teacher' do expect(grants_access?(pals.shs_fatima_science_teacher)).to eq false end
  # end
end
