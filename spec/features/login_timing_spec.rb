require 'rails_helper'
require 'capybara/rspec'

describe 'login timing', type: :feature do
  let!(:pals) { TestPals.create! }
  before(:each) { LoginTests.reset_rack_attack! }

  def sample_educator(seed)
    Educator.all.sample(random: Random.new(seed))
  end

  def attempt_variants(seed)
    [
      [sample_educator(seed).email, 'demo-password'],
      [sample_educator(seed).email, 'wrong-password'],
      [sample_educator(seed).email, ''],
      ['invalid-login', 'wrong-password'],
      ['invalid-login', '']
    ]
  end

  def create_multiple_attempts(n, seed)
    attempts = []
    n.times { attempts += attempt_variants(seed) }
    attempts.shuffle(random: Random.new(seed))
  end

  def reset_login_attempt!
    Rack::Attack.cache.store.clear
    sign_out if page.has_content?('Sign Out')
  end

  # simulate a really slow response from an LDAP #bind
  def mock_slow_ldap_bind!(username, password, delay_milliseconds)
    slow_mock_ldap = MockLDAP.new({
      auth: {
        username: username,
        password: password
      }
    })
    allow(slow_mock_ldap).to receive(:bind) do
      sleep(delay_milliseconds/1000.0)
      false
    end
    allow(MockLDAP).to receive(:new).and_return(slow_mock_ldap)
    nil
  end

  def puts_debug(login, password, elapsed_milliseconds)
    # puts '---------'
    # puts "login: #{login}"
    # puts "password: #{password}"
    # puts "elapsed_milliseconds: #{elapsed_milliseconds}"
    # puts
    # puts
  end

  # the first sign in during the test run can take ~2500ms, so
  # for any specs that are testing timing, do a "warm up" before
  # measuring timing for reals (eg https://travis-ci.org/studentinsights/studentinsights/builds/458182204#L2665)
  def warm_up!
    sign_in_attempt(pals.uri.email, 'demo-password')
    reset_login_attempt!
  end

  context 'when login is empty' do
    before(:each) { LoginTests.before_set_login_timing!(5000) }
    after(:each) { LoginTests.after_reset_login_timing! }

    it 'does not have consistent timing since Devise short-circuits (after warm-up)' do
      warm_up!
      _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
        sign_in_attempt('', 'foo')
      end
      expect(elapsed_milliseconds).to be < 1000
    end
  end

  context 'when longer than expected' do
    before(:each) { LoginTests.before_set_login_timing!(500) }
    after(:each) { LoginTests.after_reset_login_timing! }

    it 'tolerates and warns' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('ConsistentTiming#wait_for_milliseconds_or_alert was negative', {
        milliseconds_to_wait: anything
      })

      login, password = [pals.uri.email, 'wrong-password']
      _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
        mock_slow_ldap_bind!(login, password, 1000)
        sign_in_attempt(login, password)
      end
      reset_login_attempt!

      puts_debug(login, password, elapsed_milliseconds)
      expect(elapsed_milliseconds).to be > 1000
    end
  end

  context 'across all execution paths' do
    let!(:expected_timing_in_milliseconds) { 500 }
    before(:each) { LoginTests.before_set_login_timing!(expected_timing_in_milliseconds) }
    after(:each) { LoginTests.after_reset_login_timing! }

    it 'has consistent timing within range (after warm-up)' do
      warm_up!

      # test a sampling of attempts in random order; none should leak what's
      # happening on the server-side through response timing
      create_multiple_attempts(2, RSpec.configuration.seed).each do |attempt|
        login, password = attempt
        _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
          print('✓') # a nice progress indicator since these are slower tests
          sign_in_attempt(login, password)
        end
        reset_login_attempt! # not measured

        tolerance_ms = 100
        puts_debug(login, password, elapsed_milliseconds)
        expect(elapsed_milliseconds).to be_within(tolerance_ms).of(expected_timing_in_milliseconds), "unexpected timing for login='#{login}' and password='#{password}'  timing: #{elapsed_milliseconds}"
      end
    end
  end
end
