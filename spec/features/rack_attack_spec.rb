require 'rails_helper'
require 'capybara/rspec'

describe 'Rack::Attack respects example development config', type: :feature do
  let!(:pals) { TestPals.create! }
  before(:each) { LoginTests.reset_rack_attack! }
  before(:each) { LoginTests.before_disable_consistent_timing! }
  after(:each) { LoginTests.after_reenable_consistent_timing! }

  it 'blocks repeated login attempts by IP' do
    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('Rack::Attack: throttled the request')
    5.times do
      sign_in_attempt(rand().to_s, 'password')
      expect(page).to have_content LoginTests.failed_login_message
    end
    sign_in_attempt(rand().to_s, 'password')
    expect(page).to have_content 'Hello! This request has been blocked.'
  end

  it 'blocks repeated login attempts by login name' do
    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('Rack::Attack: throttled the request')
    3.times do
      sign_in_attempt('sameeducatorname', 'password')
      expect(page).to have_content LoginTests.failed_login_message
    end
    sign_in_attempt('sameeducatorname', 'password')
    expect(page).to have_content 'Hello! This request has been blocked.'
  end

  it 'blocks requests for PHP' do
    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('Rack::Attack: blocklisted the request')
    visit '/hacking.php?hacking=hacking'
    expect(page).to have_content 'Hello! This request has been blocked.'
  end

  it 'blocks requests for ASP' do
    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('Rack::Attack: blocklisted the request')
    visit '/hacking.aspx?hacking=hacking'
    expect(page).to have_content 'Hello! This request has been blocked.'
  end
end
