require 'rails_helper'
require 'capybara/rspec'

describe 'Multifactor', type: :feature do
  let!(:pals) { TestPals.create! }
  before(:each) { LoginTests.reset_rack_attack! }

  def before_set_timing!(milliseconds)
    @store_CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS = ENV['CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS']
    ENV['CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS'] = milliseconds.to_s
  end

  def after_reset_timing!
    ENV['CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS'] = @store_CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS
  end

  # the first sign in during the test run can take ~2500ms, so
  # for any specs that are testing timing, do a "warm up" before
  # measuring timing for reals (eg https://travis-ci.org/studentinsights/studentinsights/builds/458182204#L2665)
  def warm_up!
    sign_in_attempt(pals.uri.email, 'demo-password')
    reset_login_attempt!
  end

  def request_login_code(login_text)
    visit root_url
    fill_in 'multifactor_login_text', with: login_text
    click_button 'Send code'
  end

  def login_text_variants(seed)
    [
      sample_educator(seed).login_name,
      sample_educator(seed).login_name,
      sample_educator(seed).login_name,
      'invalid-login-text'
    ]
  end

  def create_multiple_login_texts(n, seed)
    create_multiple_login_texts = []
    n.times { create_multiple_login_texts += login_text_variants(seed) }
    create_multiple_login_texts.uniq.shuffle(random: Random.new(seed))
  end

  describe 'with timing disabled' do
    # before(:each) { LoginTests.reset_rack_attack! }
    # before(:each) { LoginTests.before_disable_consistent_timing! }
    # after(:each) { LoginTests.after_reenable_consistent_timing! }

    # it 'blocks repeated login attempts by IP' do
    #   allow(Rollbar).to receive(:warn)
    #   expect(Rollbar).to receive(:warn).once.with('Rack::Attack: throttled the request')
    #   5.times do
    #     sign_in_attempt(rand().to_s, 'password')
    #     expect(page).to have_content LoginTests.failed_login_message
    #   end
    #   sign_in_attempt(rand().to_s, 'password')
    #   expect(page).to have_content 'Hello! This request has been blocked.'
    # end

    # it 'blocks repeated login attempts by login name' do
    #   allow(Rollbar).to receive(:warn)
    #   expect(Rollbar).to receive(:warn).once.with('Rack::Attack: throttled the request')
    #   3.times do
    #     sign_in_attempt('sameeducatorname', 'password')
    #     expect(page).to have_content LoginTests.failed_login_message
    #   end
    #   sign_in_attempt('sameeducatorname', 'password')
    #   expect(page).to have_content 'Hello! This request has been blocked.'
    # end

    # it 'blocks requests for PHP' do
    #   allow(Rollbar).to receive(:warn)
    #   expect(Rollbar).to receive(:warn).once.with('Rack::Attack: blocklisted the request')
    #   visit '/hacking.php?hacking=hacking'
    #   expect(page).to have_content 'Hello! This request has been blocked.'
    # end

    # it 'blocks requests for ASP' do
    #   allow(Rollbar).to receive(:warn)
    #   expect(Rollbar).to receive(:warn).once.with('Rack::Attack: blocklisted the request')
    #   visit '/hacking.aspx?hacking=hacking'
    #   expect(page).to have_content 'Hello! This request has been blocked.'
    # end
  end

  describe 'with consistent timing, set to shorter duration for faster tests' do
    context 'across all execution paths' do
      let!(:expected_timing_in_milliseconds) { 500 }
      before(:each) { before_set_timing!(expected_timing_in_milliseconds) }
      after(:each) { after_reset_timing! }

      it 'has consistent timing within range (after warm-up)' do
        LoginTests.warm_up!

        # test a sampling of attempts in random order; none should leak what's
        # happening on the server-side through response timing
        create_multiple_login_texts(2, RSpec.configuration.seed).each do |login_text|
          _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
            print('✓') # a nice progress indicator since these are slower tests
            request_login_code(login_text)
          end
          sign_out if page.has_content?('Sign Out')

          tolerance_ms = 100
          expect(elapsed_milliseconds).to be_within(tolerance_ms).of(expected_timing_in_milliseconds), "unexpected timing for login_text='#{login_text}'  timing: #{elapsed_milliseconds}"
        end
      end
    end
  end
end
