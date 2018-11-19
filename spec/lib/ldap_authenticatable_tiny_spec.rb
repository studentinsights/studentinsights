RSpec.describe 'LdapAuthenticatableTiny' do
  before(:each) do
    @timing = ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS']
    ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = '500'
  end
  after(:each) { ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = @timing }

  def test_strategy
    warden_env = nil
    Devise::Strategies::LdapAuthenticatableTiny.new(warden_env)
  end

  describe '#authenticate! integration tests across districts, with is_authorized_by_ldap mocked' do
    def mocked_test_strategy(options = {})
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: options[:login_text],
          login_code: options.fetch(:login_code, 'NO_CODE')
        },
        password: options[:password]
      })

      allow(strategy).to receive(:is_authorized_by_ldap?).with(options[:ldap_login], options[:password]).and_return options[:is_authorized_by_ldap?]
      strategy
    end

    # just sugar
    def outcomes_after_authenticate!(strategy)
      strategy.authenticate!
      [strategy.result, strategy.message, strategy.user]
    end

    it 'works for Somerville' do
      allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::SOMERVILLE))
      pals = TestPals.create!(email_domain: 'k12.somerville.ma.us')
      strategy = mocked_test_strategy({
        login_text: 'uri@k12.somerville.ma.us',
        password: 'supersecure',
        ldap_login: 'uri@k12.somerville.ma.us',
        is_authorized_by_ldap?: true
      })
      expect(outcomes_after_authenticate!(strategy)).to eq [:success, nil, pals.uri]
    end

    it 'works for New Bedford' do
      pals = TestPals.create!(email_domain: 'newbedfordschools.org')
      allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::NEW_BEDFORD))
      strategy = mocked_test_strategy({
        login_text: 'uri@newbedfordschools.org',
        password: 'supersecure',
        ldap_login: 'uri@newbedfordschools.org',
        is_authorized_by_ldap?: true
      })
      expect(outcomes_after_authenticate!(strategy)).to eq [:success, nil, pals.uri]
    end

    it 'works for Bedford' do
      pals = TestPals.create!(email_domain: 'bedfordps.org')
      allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))
      strategy = mocked_test_strategy({
        login_text: 'uri',
        password: 'supersecure',
        ldap_login: 'uri@bedford.k12.ma.us',
        is_authorized_by_ldap?: true
      })
      expect(outcomes_after_authenticate!(strategy)).to eq [:success, nil, pals.uri]
    end

    it 'works for demo' do
      pals = TestPals.create!
      allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::DEMO))
      strategy = mocked_test_strategy({
        login_text: 'uri@demo.studentinsights.org',
        password: 'supersecure',
        ldap_login: 'uri@demo.studentinsights.org',
        is_authorized_by_ldap?: true
      })
      expect(outcomes_after_authenticate!(strategy)).to eq [:success, nil, pals.uri]
    end
  end

  describe '#authenticate! when methods are mocked' do
    def expect_failure(strategy, symbol)
      expect(strategy.result).to eq :failure
      expect(strategy.message).to eq symbol
      expect(strategy.user).to eq nil
    end

    let!(:pals) { TestPals.create! }

    it 'fails and alerts if a) upstream bug allows empty login_text and b) downstream bug would allow it to authenticate' do
      expect(Rollbar).to receive(:error).with('LdapAuthenticatableTiny called with invalid params')
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: '',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('', 'correct-password').and_return true

      strategy.authenticate!
      expect_failure(strategy, :invalid)
    end

    it 'fails and alerts if a) upstream bug allows empty login_code and b) downstream bug would allow it to authenticate' do
      expect(Rollbar).to receive(:error).with('LdapAuthenticatableTiny called with invalid params')
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'uri@demo.studentinsights.org',
          login_code: ''
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'correct-password').and_return true

      strategy.authenticate!
      expect_failure(strategy, :invalid)
    end

    it 'fails and alerts if a) upstream bug allows empty password and b) downstream bug would allow it to authenticate' do
      expect(Rollbar).to receive(:error).with('LdapAuthenticatableTiny called with invalid params')
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'uri@demo.studentinsights.org',
          login_code: 'NO_CODE'
        },
        password: ''
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', '').and_return true

      strategy.authenticate!
      expect_failure(strategy, :invalid)
    end

    it 'fails if user tries to sign in with login code when multifactor is not enabled' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'uri@demo.studentinsights.org',
          login_code: '123456'
        },
        password: 'demo-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', '').and_return true

      strategy.authenticate!
      expect_failure(strategy, :unexpected_multifactor)
    end

    it 'calls fail when email not found' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'foo@demo.studentinsights.org',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })

      strategy.authenticate!
      expect_failure(strategy, :not_found_in_database)
    end

    it 'calls fail when email found but not is_authorized_by_ldap?' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'uri@demo.studentinsights.org',
          login_code: 'NO_CODE'
        },
        password: 'wrong-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'wrong-password').and_return false

      strategy.authenticate!
      expect_failure(strategy, :invalid)
    end

    it 'reports error and calls fail! when is_authorized_by_ldap? times out' do
      expect(Rollbar).to receive(:error).with(any_args)

      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'uri@demo.studentinsights.org',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'correct-password').and_raise(Net::LDAP::Error)
      strategy.authenticate!

      expect_failure(strategy, :error)
    end

    it 'calls success! when valid Educator and is_authorized_by_ldap?' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'uri@demo.studentinsights.org',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'correct-password').and_return true
      strategy.authenticate!

      expect(strategy.result).to eq :success
      expect(strategy.message).to eq nil
      expect(strategy.user).to eq pals.uri
    end

    it 'calls success! even when login cases are different' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'URI@demo.STUDENTINSIGHTS.org',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'correct-password').and_return true
      strategy.authenticate!

      expect(strategy.result).to eq :success
      expect(strategy.message).to eq nil
      expect(strategy.user).to eq pals.uri
    end
  end

  describe '#is_multifactor_required?' do
    it 'always returns false' do
      strategy = test_strategy
      expect(strategy.send(:is_multifactor_required?, Educator.all.sample)).to eq false
    end
  end

  describe '#is_multifactor_code_valid?' do
    it 'always returns false' do
      strategy = test_strategy
      expect(strategy.send(:is_multifactor_code_valid?, Educator.all.sample, 'demo-password')).to eq false
    end
  end
end
