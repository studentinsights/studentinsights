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

  def expect_failure(strategy, symbol)
    expect(strategy.result).to eq :failure
    expect(strategy.message).to eq symbol
    expect(strategy.user).to eq nil
  end

  def mock_authenticate_with_laura!(is_authorized)
    strategy = test_strategy
    allow(strategy).to receive_messages({
      authentication_hash: {
        login_text: 'laura',
        login_code: 'NO_CODE'
      },
      password: 'correct-password'
    })
    allow(strategy).to receive(:is_authorized_by_ldap?).with('laura@demo.studentinsights.org', 'correct-password').and_return is_authorized
    allow(strategy).to receive(:is_multifactor_enabled?).and_return(false)
    strategy.authenticate!
    strategy
  end

  describe '#authenticate! across districts, mocking everything without multifactor' do
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
      allow(strategy).to receive(:is_multifactor_enabled?).and_return(false)
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
        login_text: 'uri',
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
        login_text: 'uri',
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
        login_text: 'uri',
        password: 'supersecure',
        ldap_login: 'uri@demo.studentinsights.org',
        is_authorized_by_ldap?: true
      })
      expect(outcomes_after_authenticate!(strategy)).to eq [:success, nil, pals.uri]
    end
  end

  describe '#authenticate! when no multifactor and methods and mocked' do
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
          login_text: 'jodi',
          login_code: ''
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('jodi@demo.studentinsights.org', 'correct-password').and_return true

      strategy.authenticate!
      expect_failure(strategy, :invalid)
    end

    it 'fails and alerts if a) upstream bug allows empty password and b) downstream bug would allow it to authenticate' do
      expect(Rollbar).to receive(:error).with('LdapAuthenticatableTiny called with invalid params')
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'jodi',
          login_code: 'NO_CODE'
        },
        password: ''
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('jodi@demo.studentinsights.org', '').and_return true

      strategy.authenticate!
      expect_failure(strategy, :invalid)
    end

    it 'fails if user tries to sign in with login code when multifactor is not enabled, and does not query LDAP' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'jodi',
          login_code: '123456'
        },
        password: 'demo-password'
      })
      expect(strategy).not_to receive(:is_authorized_by_ldap?)

      strategy.authenticate!
      expect_failure(strategy, :unexpected_multifactor)
    end

    it 'calls fail when email not found without querying LDAP' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'foo',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      expect(strategy).not_to receive(:is_authorized_by_ldap?)

      strategy.authenticate!
      expect_failure(strategy, :not_found_in_database)
    end

    it 'calls fail when email found but not active?, without querying LDAP' do
      pals.shs_jodi.update!(missing_from_last_export: true)
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'jodi',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      expect(strategy).not_to receive(:is_authorized_by_ldap?)

      strategy.authenticate!
      expect_failure(strategy, :not_active)
    end

    it 'calls fail when email found but not is_authorized_by_ldap?' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'jodi',
          login_code: 'NO_CODE'
        },
        password: 'wrong-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('jodi@demo.studentinsights.org', 'wrong-password').and_return false

      strategy.authenticate!
      expect_failure(strategy, :invalid)
    end

    it 'reports error and calls fail! when is_authorized_by_ldap? times out' do
      expect(Rollbar).to receive(:error).with(any_args)

      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'jodi',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('jodi@demo.studentinsights.org', 'correct-password').and_raise(Net::LDAP::Error)
      strategy.authenticate!

      expect_failure(strategy, :error)
    end

    it 'calls success! when valid Educator and is_authorized_by_ldap?' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'jodi',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('jodi@demo.studentinsights.org', 'correct-password').and_return true
      strategy.authenticate!

      expect(strategy.result).to eq :success
      expect(strategy.message).to eq nil
      expect(strategy.user).to eq pals.shs_jodi
    end

    it 'calls success! even when login cases are different' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'JODI',
          login_code: 'NO_CODE'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('jodi@demo.studentinsights.org', 'correct-password').and_return true
      strategy.authenticate!

      expect(strategy.result).to eq :success
      expect(strategy.message).to eq nil
      expect(strategy.user).to eq pals.shs_jodi
    end
  end

  describe '#authenticate! through multifactor' do
    let!(:pals) { TestPals.create! }

    it 'success! for Uri through authenticator app when login_code is correct' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'uri',
          login_code: LoginTests.peek_at_correct_multifactor_code(pals.uri)
        },
        password: 'demo-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'demo-password').and_return true

      strategy.authenticate!
      expect(strategy.result).to eq :success
      expect(strategy.message).to eq nil
      expect(strategy.user).to eq pals.uri
    end

    it 'success! for Rich over SMS when login_code is correct' do
      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'rich',
          login_code: LoginTests.peek_at_correct_multifactor_code(pals.rich_districtwide)
        },
        password: 'demo-password'
      })
      allow(strategy).to receive(:is_authorized_by_ldap?).with('rich@demo.studentinsights.org', 'demo-password').and_return true

      strategy.authenticate!
      expect(strategy.result).to eq :success
      expect(strategy.message).to eq nil
      expect(strategy.user).to eq pals.rich_districtwide
    end

    it 'reports error and calls fail! when is_multifactor_code_valid? raises and does not query LDAP' do
      expect(Rollbar).to receive(:error).with(any_args)

      strategy = test_strategy
      allow(strategy).to receive_messages({
        authentication_hash: {
          login_text: 'rich',
          login_code: '123456'
        },
        password: 'correct-password'
      })
      allow(strategy).to receive(:is_multifactor_code_valid?).with(pals.rich_districtwide, '123456').and_raise(Twilio::REST::TwilioError)
      expect(strategy).not_to receive(:is_authorized_by_ldap?)

      strategy.authenticate!

      expect_failure(strategy, :error)
    end

    it 'fail! for all users if wrong login_code and does not query LDAP' do
      Educator.all.each do |educator|
        login_text = "#{educator.login_name}@demo.studentinsights.org"
        strategy = test_strategy
        allow(strategy).to receive_messages({
          authentication_hash: {
            login_text: login_text,
            login_code: '123456'
          },
          password: 'demo-password'
        })
        allow(strategy).to receive(:is_authorized_by_ldap?).with(login_text, 'demo-password').and_return true
        expect(strategy).not_to receive(:is_authorized_by_ldap?)

        strategy.authenticate!
        expect(strategy.result).to eq :failure
        expect(strategy.user).to eq nil
      end
    end
  end

  describe '#authenticate! and store_password_checks' do
    let!(:pals) { TestPals.create! }

    it 'does not run when authentication fails' do
      strategy = mock_authenticate_with_laura!(false)
      expect(strategy.result).to eq :failure
      expect(PasswordCheck.all.size).to eq 0
    end

    it 'runs when authentication succeeds' do
      strategy = mock_authenticate_with_laura!(true)
      expect(strategy.result).to eq :success
      expect(PasswordCheck.all.size).to eq 1
      expect(PasswordCheck.all.to_json).not_to include('correct-password')
    end

    it 'ignores errors with computing, and reports without logging password' do
      allow(PasswordChecker).to receive(:new).and_raise(NoMethodError)
      allow(Rollbar).to receive(:error)
      expect(Rollbar).to receive(:error).once.with('LdapAuthenticatableTiny, store_password_check raised NoMethodError, ignoring and continuing...')

      strategy = mock_authenticate_with_laura!(true)
      expect(strategy.result).to eq :success
      expect(PasswordCheck.all.size).to eq 0
    end

    it 'ignores errors with storing, and reports without logging password' do
      allow(PasswordCheck).to receive(:create!).and_raise(NoMethodError)
      allow(Rollbar).to receive(:error)
      expect(Rollbar).to receive(:error).once.with('LdapAuthenticatableTiny, store_password_check raised NoMethodError, ignoring and continuing...')

      strategy = mock_authenticate_with_laura!(true)
      expect(strategy.result).to eq :success
      expect(PasswordCheck.all.size).to eq 0
    end
  end

  describe '#authenticate! and warn_if_suspicious' do
    let!(:pals) { TestPals.create! }

    it 'does not run when authentication fails' do
      expect(LoginChecker).not_to receive(:new)
      strategy = mock_authenticate_with_laura!(false)
      expect(strategy.result).to eq :failure
    end

    it 'runs when authentication succeeds' do
      expect(LoginChecker).to receive(:new)
      strategy = mock_authenticate_with_laura!(true)
      expect(strategy.result).to eq :success
    end

    it 'ignores errors, and reports without logging password' do
      allow(LoginChecker).to receive(:new).and_raise(NoMethodError)
      allow(Rollbar).to receive(:error)
      expect(Rollbar).to receive(:error).once.with('LdapAuthenticatableTiny, warn_if_suspicious raised, ignoring and continuing...')

      strategy = mock_authenticate_with_laura!(true)
      expect(strategy.result).to eq :success
    end

    it 'warns about first_login_month_after_creation' do
      allow(Net::HTTP).to receive(:post_form)
      pals.healey_laura_principal.update!(created_at: pals.time_now - 32.days)
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with('LoginChecker#warn_if_suspicious', {
        flags: [:first_login_month_after_creation],
        warning_id: anything(),
        time_now: anything()
      })

      strategy = mock_authenticate_with_laura!(true)
      expect(strategy.result).to eq :success
    end

    it 'warns about first_login_after_six_months' do
      allow(Net::HTTP).to receive(:post_form)
      LoginActivity.create!({
        user_id: pals.healey_laura_principal.id,
        created_at: pals.time_now - 2.years
      })
      allow(Rollbar).to receive(:warn)
      expect(Rollbar).to receive(:warn).once.with("LoginChecker#warn_if_suspicious", {
        flags: [:first_login_after_six_months],
        warning_id: anything(),
        time_now: anything()
      })

      strategy = mock_authenticate_with_laura!(true)
      expect(strategy.result).to eq :success
    end
  end
end
