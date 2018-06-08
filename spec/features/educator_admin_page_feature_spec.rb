require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in', type: :feature do
  let!(:pals) { TestPals.create! }

  def grants_access?(educator)
    sign_in_attempt(educator.email, 'demo-password')
    visit admin_root_url

    checks = []
    checks << true if current_path == '/admin'
    checks << true if page.has_content?('Educator permissions: Overview')
    checks.any?
  end

  it 'works for Uri' do expect(grants_access?(pals.uri)).to eq true end

  describe 'blocks all other TestPals' do
    it 'rich_districtwide' do expect(grants_access?(pals.rich_districtwide)).to eq false end
    it 'healey_vivian_teacher' do expect(grants_access?(pals.healey_vivian_teacher)).to eq false end
    it 'healey_ell_teacher' do expect(grants_access?(pals.healey_ell_teacher)).to eq false end
    it 'healey_sped_teacher' do expect(grants_access?(pals.healey_sped_teacher)).to eq false end
    it 'healey_laura_principal' do expect(grants_access?(pals.healey_laura_principal)).to eq false end
    it 'healey_sarah_teacher' do expect(grants_access?(pals.healey_sarah_teacher)).to eq false end
    it 'west_marcus_teacher' do expect(grants_access?(pals.west_marcus_teacher)).to eq false end
    it 'shs_jodi' do expect(grants_access?(pals.shs_jodi)).to eq false end
    it 'shs_bill_nye' do expect(grants_access?(pals.shs_bill_nye)).to eq false end
    it 'shs_ninth_grade_counselor' do expect(grants_access?(pals.shs_ninth_grade_counselor)).to eq false end
    it 'shs_hugo_art_teacher' do expect(grants_access?(pals.shs_hugo_art_teacher)).to eq false end
    it 'shs_fatima_science_teacher' do expect(grants_access?(pals.shs_fatima_science_teacher)).to eq false end
  end
end
