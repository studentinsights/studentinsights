require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in', type: :feature do
  let!(:pals) { TestPals.create! }

  before(:each) { LoginTests.reset_rack_attack! }
  before(:each) { LoginTests.before_disable_consistent_timing! }
  after(:each) { LoginTests.after_reenable_consistent_timing! }

  def grants_access?(educator)
    run_all_checks_for(educator).any? # fail if any check passes
  end

  def run_checks_for(path, title, educator)
    visit path

    # raise if it's a Rails error page
    # (ie, https://github.com/thoughtbot/administrate/pull/1452)
    # also, sadly page.has_text? does not actually work here :(
    if page.html.include?('backtrace') || page.html.include?('lib/rspec/core')
      raise 'rails error page!'
    end

    checks = []
    checks << (current_path == path)
    checks << (page.html.include?(title))
    checks
  end

  def run_all_checks_for(educator)
    checks = []

    feature_sign_in(educator, multifactor_cheating: true)
    checks += run_checks_for('/admin', 'Adjust permissions for educators', educator)
    checks += run_checks_for('/admin/authorization', 'Sensitive access', educator)
    checks += run_checks_for('/admin/labels', 'control access to particular features', educator)
    feature_sign_out

    checks
  end

  it 'grants project lead access and passes smoke test' do
    expect(run_all_checks_for(pals.uri).all?).to eq true
  end

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
    it 'shs_sofia_counselor' do expect(grants_access?(pals.shs_sofia_counselor)).to eq false end
    it 'shs_hugo_art_teacher' do expect(grants_access?(pals.shs_hugo_art_teacher)).to eq false end
    it 'shs_fatima_science_teacher' do expect(grants_access?(pals.shs_fatima_science_teacher)).to eq false end
  end

  it 'passes smoke test for /labels' do
    feature_sign_in(pals.uri, multifactor_cheating: true)
    visit '/admin/labels'
    label_keys = EducatorLabel.all.map(&:label_key).uniq
    label_keys_on_page = label_keys.select {|labe_key| page.html.include?(labe_key) }
    expect(label_keys_on_page).to match_array(label_keys)
    feature_sign_out
  end
end
