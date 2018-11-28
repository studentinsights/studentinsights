require 'rails_helper'

describe 'Rollbar scrubs properly', type: :feature do

  def rollbar_filepath
    Rails.root.join(File.join('tmp', 'test-output.rollbar'))
  end

  def cleanup!
    File.delete(rollbar_filepath) if File.exist?(rollbar_filepath)
  end

  def capture_rollbar_to_disk!
    cleanup!
    Rollbar.configure do |config|
      config.enabled = true
      config.write_to_file = true
      config.filepath = rollbar_filepath
    end
  end

  def reset_rollbar_config!
    Rollbar.configure do |config|
      config.enabled = false
      config.write_to_file = false
      config.filepath = nil
    end
    cleanup!
  end

  def visit_test_page
    visit '/hacking.aspx?foo=SENSITIVE-param'
    string = IO.read(rollbar_filepath)
    [string, JSON.parse(string)]
  end

  describe 'with Rollbar enabled' do
    before(:each) { LoginTests.reset_rack_attack! }
    before(:each) { LoginTests.before_disable_consistent_timing! }
    after(:each) { LoginTests.after_reenable_consistent_timing! }

    let!(:pals) { TestPals.create! }
    before { capture_rollbar_to_disk! }
    after { reset_rollbar_config! }

    it 'does not log sensitive data in cookies or querystring' do
      page.driver.browser.set_cookie('_example_cookie=SENSITIVE-cookie-value')
      rollbar_string, rollbar_json = visit_test_page
      expect(rollbar_string).not_to include('SENSITIVE')
      expect(rollbar_json['data']['request']['url'].starts_with?('http://www.example.com/hacking.aspx?foo=***')).to eq true # Rollbar randomizes length of scrubbed string
    end

    it 'does not log sensitive session data when signed in' do
      educator = Educator.all.sample
      feature_sign_in(educator)
      rollbar_string, rollbar_json = visit_test_page

      expect(rollbar_string).not_to include('SENSITIVE')
      expect(rollbar_string).not_to include(educator.email)
      expect(rollbar_string).not_to include(educator.login_name)
      expect(rollbar_json['data']['request']['session']['session_id'].starts_with?('***')).to eq true
    end

    it 'does log educator_id, for debugging and support' do
      educator = Educator.all.sample
      feature_sign_in(educator)
      rollbar_string, rollbar_json = visit_test_page

      expect(rollbar_string).not_to include('SENSITIVE')
      expect(rollbar_json['data']['request']['session']['warden.user.educator.key']).to eq [[educator.id], nil]
    end

    it 'does log IP, so we can use it to investigate attacks' do
      feature_sign_in(pals.uri)
      rollbar_string, rollbar_json = visit_test_page
      expect(rollbar_string).not_to include('SENSITIVE')
      expect(rollbar_json['data']['request']['user_ip']).to eq '127.0.0.1'
    end
  end
end
