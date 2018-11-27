require 'rails_helper'
require 'capybara/rspec'

describe 'Rack::Attack respects example development config', type: :feature do
  let!(:pals) { TestPals.create! }
  before(:each) { LoginTests.reset_rack_attack! }
  before(:each) { LoginTests.before_disable_consistent_timing! }
  after(:each) { LoginTests.after_reenable_consistent_timing! }

  it 'throttles repeated login attempts by IP' do
    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `throttle logins/ip/1`')
    5.times do
      sign_in_attempt(rand().to_s, 'password')
      expect(page).to have_content LoginTests.failed_login_message
    end
    sign_in_attempt(rand().to_s, 'password')
    expect(page).to have_content 'Hello! This request has been blocked.'
  end

  it 'throttles repeated login attempts by login name' do
    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('Rack::Attack matched `throttle logins/login_text`')
    3.times do
      sign_in_attempt('sameeducatorname', 'password')
      expect(page).to have_content LoginTests.failed_login_message
    end
    sign_in_attempt('sameeducatorname', 'password')
    expect(page).to have_content 'Hello! This request has been blocked.'
  end

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

  describe 'when from whitelisted IP' do
    before do
      allow_any_instance_of(Rack::Attack::Request).to receive(:ip).and_return('127.0.0.77')
    end

    it 'does not throttle by IP or login name' do
      expect(Rollbar).not_to receive(:warn)
      6.times do
        sign_in_attempt(rand().to_s, 'password')
        expect(page).to have_content 'Invalid login or password.'
        expect(page).not_to have_content 'Hello! This request has been blocked.'
      end
    end
  end
end
