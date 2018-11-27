require 'rails_helper'
require 'capybara/rspec'

describe 'Rack::Attack respects example development config', type: :feature do
  let!(:pals) { TestPals.create! }
  before(:each) { LoginTests.reset_rack_attack! }
  before(:each) { LoginTests.before_disable_consistent_timing! }
  after(:each) { LoginTests.after_reenable_consistent_timing! }

  describe 'login' do
    it 'throttles repeated login attempts by IP' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `throttle logins/ip/1`')
      5.times do
        feature_plain_sign_in(rand().to_s, 'password')
        expect(page).to have_content LoginTests.failed_login_message
      end
      feature_plain_sign_in(rand().to_s, 'password')
      expect(page).to have_content 'Hello! This request has been blocked.'
    end

    it 'throttles repeated login attempts by login name' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `throttle logins/login_text`')
      3.times do
        feature_plain_sign_in('sameeducatorname', 'password')
        expect(page).to have_content LoginTests.failed_login_message
      end
      feature_plain_sign_in('sameeducatorname', 'password')
      expect(page).to have_content 'Hello! This request has been blocked.'
    end
  end

  describe 'multifactor' do
    it 'throttles repeated multifactor attempts by IP' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `throttle multifactor/ip/1`')
      5.times do
        expect(feature_submit_multifactor_form_manually(page, rand().to_s).status).to eq 204
      end
      feature_submit_multifactor_form_manually(page, rand().to_s)
      expect(page).to have_content 'Hello! This request has been blocked.'
    end

    it 'throttles repeated multifactor attempts by login name' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `throttle multifactor/login_text`')
      3.times do
        expect(feature_submit_multifactor_form_manually(page, 'sameeducatorname').status).to eq 204
      end
      feature_submit_multifactor_form_manually(page, 'sameeducatorname')
      expect(page).to have_content 'Hello! This request has been blocked.'
    end
  end

  describe 'noise' do
    it 'blocks requests for PHP' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `blocklist req/noise`')
      visit '/hacking.php?hacking=hacking'
      expect(page).to have_content 'Hello! This request has been blocked.'
    end

    it 'blocks requests for ASP' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `blocklist req/noise`')
      visit '/hacking.aspx?hacking=hacking'
      expect(page).to have_content 'Hello! This request has been blocked.'
    end
  end

  describe 'when from whitelisted IP' do
    before do
      allow_any_instance_of(Rack::Attack::Request).to receive(:ip).and_return('127.0.0.77')
    end

    it 'does not throttle by IP or login name' do
      expect(Rollbar).not_to receive(:warn)
      6.times do
        feature_plain_sign_in(rand().to_s, 'password')
        expect(page).to have_content 'Invalid login, password, or code.'
        expect(page).not_to have_content 'Hello! This request has been blocked.'
      end
    end
  end
end
