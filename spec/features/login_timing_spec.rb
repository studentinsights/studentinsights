require 'rails_helper'
require 'capybara/rspec'

describe 'login timing', type: :feature do
  let!(:pals) { TestPals.create! }
  before(:each) { Rack::Attack.cache.store.clear }

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

  def puts_debug(login, password, elapsed_milliseconds)
    # puts '---------'
    # puts "login: #{login}"
    # puts "password: #{password}"
    # puts "elapsed_milliseconds: #{elapsed_milliseconds}"
    # puts
    # puts
  end

  it 'does not have consistent timing for empty login, since Devise short-circuits' do
    _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
      sign_in_attempt('', 'foo')
    end
    expect(elapsed_milliseconds).to be < 1000
  end

  context 'when longer than expected' do
    before(:each) { @timing = ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS']}
    before(:each) { ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = '500' }
    after(:each) { ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = @timing }

    # simulate a really slow response from #bind
    def mock_slow_ldap_bind!(login, password, delay_milliseconds)
      slow_mock_ldap = MockLDAP.new({
        auth: {
          username: login,
          password: password
        }
      })
      allow(slow_mock_ldap).to receive(:bind) { sleep(delay_milliseconds/1000.0); false }
      allow(MockLDAP).to receive(:new).and_return(slow_mock_ldap)
      nil
    end

    it 'tolerates and warns' do
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('ConsistentTiming#wait_for_milliseconds_or_alert was negative', {
        milliseconds_to_wait: anything
      })

      _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
        mock_slow_ldap_bind!(pals.uri.email, 'wrong-password', 1000)
        sign_in_attempt(pals.uri.email, 'wrong-password')
      end
      expect(elapsed_milliseconds).to be > 1000
    end
  end

  context 'across all execution paths' do
    let!(:expected_timing_in_milliseconds) { 500 }

    before(:each) { @timing = ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS']}
    before(:each) { ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = expected_timing_in_milliseconds.to_s }
    after(:each) { ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = @timing }

    it 'has consistent timing within range' do
      # allow untimed warm-up (eg, seed 6996)
      sign_in_attempt(pals.uri.email, 'demo-password')
      reset_login_attempt!

      # test a sampling of attempts in random order; none should leak timing info
      create_multiple_attempts(2, RSpec.configuration.seed).each do |attempt|
        login, password = attempt
        _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
          print('✓')
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
