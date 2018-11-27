require 'rails_helper'
require 'capybara/rspec'

describe 'login timing', type: :feature do
  let!(:pals) { TestPals.create! }
  before(:each) { LoginTests.reset_rack_attack! }

  def sample_educator(seed)
    Educator.all.sample(random: Random.new(seed))
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

  context 'when fields are empty' do
    before(:each) { LoginTests.before_set_login_timing!(5000) }
    after(:each) { LoginTests.after_reset_login_timing! }

    it 'returns early when login_text is empty since Devise short-circuits (after warm-up)' do
      feature_timing_warm_up!(pals.uri)
      _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
        feature_plain_sign_in('', 'foo')
      end
      expect(elapsed_milliseconds).to be < 1000
    end

    it 'returns early when login_code is empty since Devise short-circuits (after warm-up)' do
      feature_timing_warm_up!(pals.uri)
      _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
        feature_plain_sign_in('foo', 'foo', login_code: '')
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

      login, password = [pals.shs_jodi.email, 'wrong-password']
      _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
        mock_slow_ldap_bind!(login, password, 1000)
        feature_plain_sign_in(login, password)
      end
      feature_reset_login_attempt!

      expect(elapsed_milliseconds).to be > 1000
    end
  end

  context 'across all execution paths' do
    # Include one correct attempt, and several different kinds of incorrect attempts.
    # Missing login_text and login_code aren't tested, since Devise short-circuits and fails
    # these before our code can run.
    def attempts_for_educator(educator)
      authenticator = MultifactorAuthenticator.new(educator)
      login_code = authenticator.is_multifactor_enabled? ? LoginTests.peek_at_correct_multifactor_code(educator) : '654321'

      [
        [educator.email, 'demo-password', login_code: login_code],
        [educator.email, 'demo-password', login_code: '123456'],
        [educator.email, 'wrong-password', {}],
        [educator.email, '', {}],
        [educator.email, '', login_code: login_code]
      ]
    end

    def create_attempts_across_educators(options = {})
      seed = options.fetch(:seed, RSpec.configuration.seed)
      limit = options.fetch(:limit, 1000)
      attempts_for_educators = Educator.all.flat_map do |educator|
        attempts_for_educator(educator)
      end

      attempts = attempts_for_educators + [
        ['invalid-login', 'demo-password', {}],
        ['invalid-login', '', {}],
        ['invalid-login', 'demo-password', login_code: '123456']
      ]

      attempts.shuffle(random: Random.new(seed)).first(limit)
    end

    let!(:expected_timing_in_milliseconds) { 300 }
    before(:each) { LoginTests.before_set_login_timing!(expected_timing_in_milliseconds) }
    after(:each) { LoginTests.after_reset_login_timing! }

    it 'has consistent timing within range (after warm-up)' do
      feature_timing_warm_up!(pals.uri)

      # Test many attempts across all educators in random order; none should leak what's
      # happening on the server-side through response timing.
      attempts = create_attempts_across_educators(limit: 50, seed: RSpec.configuration.seed)
      attempts.each do |attempt|
        login, password, options = attempt
        _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
          feature_plain_sign_in(login, password, options)
        end
        feature_reset_login_attempt!
        tolerance_ms = 100
        expect(elapsed_milliseconds).to be_within(tolerance_ms).of(expected_timing_in_milliseconds), "unexpected timing for login='#{login}', password='#{password}', options='#{options}'  timing: #{elapsed_milliseconds}"
        print('✓') # a nice progress indicator since these are slower tests
      end
      expect(attempts.size).to eq(50)
    end
  end
end
