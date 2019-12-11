require 'rails_helper'
require 'capybara/rspec'

describe 'educator sign in using Mock LDAP', type: :feature do
  before(:each) { LoginTests.reset_rack_attack! }
  before(:each) { LoginTests.before_disable_consistent_timing! }
  after(:each) { LoginTests.after_reenable_consistent_timing! }

  def test_pals_for!(district_key)
    per_district = PerDistrict.new(district_key: district_key)
    allow(PerDistrict).to receive(:new).and_return(per_district)
    TestPals.create!
  end

  context 'with default TestPals' do
    let!(:pals) { TestPals.create! }

    context 'teacher signs in' do
      def expect_successful_sign_in_for(educator)
        feature_sign_in(educator)
        expect(page).to have_content 'Sign Out'
      end

      it { expect_successful_sign_in_for(pals.healey_sarah_teacher) }
      it { expect_successful_sign_in_for(pals.uri) }
      it { expect_successful_sign_in_for(pals.west_marcus_teacher) }
    end

    context 'person without authorization attempts to sign in' do
      it 'cannot access students page' do
        feature_plain_sign_in('invalid-educatorname', 'password')
        expect(page).to have_content LoginTests.failed_login_message
      end
    end
  end

  describe 'for Jodi with Mock LDAP and no multifactor, integration tests work across districts' do
    it 'works for Somerville using email' do
      test_pals_for!(PerDistrict::SOMERVILLE)
      feature_plain_sign_in('jodi@k12.somerville.ma.us', 'demo-password')
      expect(page).to have_content 'Sign Out'
    end

    it 'works for New Bedford using email' do
      test_pals_for!(PerDistrict::NEW_BEDFORD)
      feature_plain_sign_in('jodi@newbedfordschools.org', 'demo-password')
      expect(page).to have_content 'Sign Out'
    end

    it 'works for Bedford using plain login_name, and separate email address for LDAP authentication' do
      test_pals_for!(PerDistrict::BEDFORD)
      feature_plain_sign_in('jodi', 'demo-password')
      expect(page).to have_content 'Sign Out'
    end

    it 'works for demo' do
      test_pals_for!(PerDistrict::DEMO)
      feature_plain_sign_in('jodi@demo.studentinsights.org', 'demo-password')
      expect(page).to have_content 'Sign Out'
    end
  end

  describe 'for Uri with authenticator MFA cheating, integration tests work for across districts' do
    it 'works for Somerville' do
      pals = test_pals_for!(PerDistrict::SOMERVILLE)
      feature_multifactor_sign_in_by_peeking(pals.uri)
      expect(page).to have_content 'Sign Out'
    end

    it 'works for New Bedford' do
      pals = test_pals_for!(PerDistrict::NEW_BEDFORD)
      feature_multifactor_sign_in_by_peeking(pals.uri)
      expect(page).to have_content 'Sign Out'
    end

    it 'works for Bedford using plain login_name' do
      pals = test_pals_for!(PerDistrict::BEDFORD)
      feature_multifactor_sign_in_by_peeking(pals.uri, login_text: 'uri')
      expect(page).to have_content 'Sign Out'
    end

    it 'works for demo' do
      pals = test_pals_for!(PerDistrict::DEMO)
      feature_multifactor_sign_in_by_peeking(pals.uri)
      expect(page).to have_content 'Sign Out'
    end
  end

  describe 'for Rich with SMS MFA cheating, integration tests work for across districts' do
    it 'works for Somerville' do
      pals = test_pals_for!(PerDistrict::SOMERVILLE)
      feature_multifactor_sign_in_by_peeking(pals.rich_districtwide)
      expect(page).to have_content 'Sign Out'
    end

    it 'works for New Bedford' do
      pals = test_pals_for!(PerDistrict::NEW_BEDFORD)
      feature_multifactor_sign_in_by_peeking(pals.rich_districtwide)
      expect(page).to have_content 'Sign Out'
    end

    it 'works for Bedford using plain login_name' do
      pals = test_pals_for!(PerDistrict::BEDFORD)
      feature_multifactor_sign_in_by_peeking(pals.rich_districtwide, login_text: 'rich')
      expect(page).to have_content 'Sign Out'
    end

    it 'works for demo' do
      pals = test_pals_for!(PerDistrict::DEMO)
      feature_multifactor_sign_in_by_peeking(pals.rich_districtwide)
      expect(page).to have_content 'Sign Out'
    end
  end

  describe 'for Harry with email MFA cheating, integration tests work for across districts' do
    it 'works for Somerville' do
      pals = test_pals_for!(PerDistrict::SOMERVILLE)
      feature_multifactor_sign_in_by_peeking(pals.shs_harry_housemaster)
      expect(page).to have_content 'Sign Out'
    end

    it 'works for New Bedford' do
      pals = test_pals_for!(PerDistrict::NEW_BEDFORD)
      feature_multifactor_sign_in_by_peeking(pals.shs_harry_housemaster)
      expect(page).to have_content 'Sign Out'
    end

    it 'works for Bedford using plain login_name' do
      pals = test_pals_for!(PerDistrict::BEDFORD)
      feature_multifactor_sign_in_by_peeking(pals.shs_harry_housemaster, login_text: 'harry')
      expect(page).to have_content 'Sign Out'
    end

    it 'works for demo' do
      pals = test_pals_for!(PerDistrict::DEMO)
      feature_multifactor_sign_in_by_peeking(pals.shs_harry_housemaster)
      expect(page).to have_content 'Sign Out'
    end
  end

  describe 'with logger spied' do
    def mock_subscribers_log!
      log = LogHelper::RailsLogger.new
      ActiveSupport::Subscriber.subscribers.each do |subscriber|
        allow(subscriber).to receive(:logger).and_return(log)
      end
      log
    end

    it 'scrubs parameters from log' do
      log = mock_subscribers_log!
      pals = test_pals_for!(PerDistrict::SOMERVILLE)
      peeked_login_code = LoginTests.peek_at_correct_multifactor_code(pals.rich_districtwide)
      feature_multifactor_sign_in_by_peeking(pals.rich_districtwide)
      expect(page).to have_content 'Sign Out'

      expect(log.output).not_to include('rich@')
      expect(log.output).not_to include('k12.somerville.ma.us')
      expect(log.output).not_to include(peeked_login_code)
      expect(log.output).not_to include('login_code')
      expect(log.output).not_to include('password')
      expect(log.output).not_to include('demo-password')
      expect(log.output).to include('Parameters: {"educator"=>"[FILTERED]"}')
    end
  end
end
