RSpec.describe 'MultifactorAuthenticator' do
  let!(:pals) { TestPals.create! }

  def log_for_mock_twilio_client
    log = LogHelper::FakeLog.new
    fake_creator = MockTwilioClient::FakeCreator.new
    allow(fake_creator).to receive(:logger).and_return(log)
    allow(MockTwilioClient::FakeCreator).to receive(:new).and_return(fake_creator)
    log
  end

  def enabled_educators
    [pals.uri, pals.rich_districtwide, pals.shs_harry_housemaster]
  end

  describe 'Twilio config missing' do
    before do
      @twilio_config_json = ENV['TWILIO_CONFIG_JSON']
      ENV.delete('TWILIO_CONFIG_JSON')
    end
    after do
      ENV['TWILIO_CONFIG_JSON'] = @twilio_config_json
    end

    it 'does not raise if Twilio config is not used' do
      expect(MultifactorAuthenticator.new(pals.uri).send_login_code_if_necessary!).to eq nil
    end

    it 'raises if Twilio config is needed' do
      expect { MultifactorAuthenticator.new(pals.rich_districtwide).send_login_code_if_necessary! }.to raise_error(Exceptions::InvalidConfiguration)
    end
  end

  describe 'Twilio config validates sending_number' do
    before do
      @twilio_config_json = ENV['TWILIO_CONFIG_JSON']
      ENV['TWILIO_CONFIG_JSON'] = '{"sending_number":"555-555-1234","account_sid":"fake","auth_token":"fake"}'
    end
    after do
      ENV['TWILIO_CONFIG_JSON'] = @twilio_config_json
    end

    it 'raises because of invalid sending_number' do
      expect { MultifactorAuthenticator.new(pals.rich_districtwide).send_login_code_if_necessary! }.to raise_error(Exceptions::InvalidConfiguration)
    end
  end

  describe 'ROTP config missing' do
    before do
      @rotp_config_json = ENV['MULTIFACTOR_AUTHENTICATOR_ROTP_CONFIG_JSON']
      ENV.delete('MULTIFACTOR_AUTHENTICATOR_ROTP_CONFIG_JSON')
    end
    after do
      ENV['MULTIFACTOR_AUTHENTICATOR_ROTP_CONFIG_JSON'] = @rotp_config_json
    end

    it 'raises without ROTP config' do
      expect { MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?('foo') }.to raise_error(Exceptions::InvalidConfiguration)
    end

    it 'raises without ROTP config' do
      expect { MultifactorAuthenticator.new(pals.rich_districtwide).send_login_code_if_necessary! }.to raise_error(Exceptions::InvalidConfiguration)
    end
  end

  describe '#is_multifactor_enabled?' do
    it 'is enabled for Uri and Rich and Harry' do
      enabled_educators.each do |educator|
        expect(MultifactorAuthenticator.new(educator).is_multifactor_enabled?).to eq true
      end
    end

    it 'is not enabled for anyone else' do
      (Educator.all - enabled_educators).each do |educator|
        expect(MultifactorAuthenticator.new(educator).is_multifactor_enabled?).to eq false
      end
    end
  end

  describe 'is_multifactor_code_valid?' do
    it 'can verify correct code' do
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)
      authenticator = MultifactorAuthenticator.new(pals.uri)
      expect(authenticator.is_multifactor_code_valid?(login_code)).to eq true
    end

    it 'does not work when using codes from another user' do
      rich_login_code = LoginTests.peek_at_correct_multifactor_code(pals.rich_districtwide)
      uri_login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)

      expect(MultifactorAuthenticator.new(pals.rich_districtwide).is_multifactor_code_valid?(uri_login_code)).to eq false
      expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?(rich_login_code)).to eq false
    end

    it 'does not work a second time after code has already been used' do
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)

      authenticator = MultifactorAuthenticator.new(pals.uri)
      expect(authenticator.is_multifactor_code_valid?(login_code)).to eq true
      expect(authenticator.is_multifactor_code_valid?(login_code)).to eq false
    end

    it 'stores last_verification_at after successful verification' do
      time_now = Time.parse('2017-03-16T11:12:00.000Z')
      Timecop.freeze(time_now) do
        login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)
        authenticator = MultifactorAuthenticator.new(pals.uri)
        expect(authenticator.is_multifactor_code_valid?(login_code)).to eq true
        expect(EducatorMultifactorConfig.find_by(educator_id: pals.uri.id).last_verification_at.to_i).to eq(time_now.to_i)
      end
    end

    it 'allows code within drift interval (when at start of window)' do
      time_now = Time.parse('2017-03-16T11:12:00.000Z')
      login_code = nil
      Timecop.freeze(time_now) do
        login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)
      end
      Timecop.freeze(time_now + 30.seconds + 29.seconds) do
        expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?(login_code)).to eq true
      end
    end

    it 'guards against stale code outside drift interval (when at start of window)' do
      time_now = Time.parse('2017-03-16T11:12:00.000Z')
      login_code = nil
      Timecop.freeze(time_now) do
        login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)
      end
      Timecop.freeze(time_now + 30.seconds + 30.seconds) do
        expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?(login_code)).to eq false
      end
    end

    it 'allows drift (when at end of window)' do
      time_now = Time.parse('2017-03-16T11:12:29.000Z')
      login_code = nil
      Timecop.freeze(time_now) do
        login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)
      end
      Timecop.freeze(time_now + 1.seconds + 29.seconds) do
        expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?(login_code)).to eq true
      end
    end

    it 'guards access (when at end of window)' do
      time_now = Time.parse('2017-03-16T11:12:29.000Z')
      login_code = nil
      Timecop.freeze(time_now) do
        login_code = LoginTests.peek_at_correct_multifactor_code(pals.uri)
      end
      Timecop.freeze(time_now + 1.seconds + 30.seconds) do
        expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?(login_code)).to eq false
      end
    end
  end

  describe '#send_login_code_if_necessary! with mocked SMS and email services' do
    it 'does nothing when multifactor not enabled' do
      log = log_for_mock_twilio_client
      (Educator.all - enabled_educators).each do |educator|
        authenticator = MultifactorAuthenticator.new(educator)
        expect(authenticator).not_to receive(:send_twilio_message!)
        authenticator.send_login_code_if_necessary!
        expect(log.output).to eq ''
      end
    end

    it 'does nothing for authenticator app' do
      log = log_for_mock_twilio_client
      authenticator = MultifactorAuthenticator.new(pals.uri)
      expect(authenticator).not_to receive(:send_twilio_message!)
      authenticator.send_login_code_if_necessary!
      expect(log.output).to eq ''
    end

    it 'works for Rich when verifying params sent to MockTwilioClient' do
      authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.rich_districtwide)

      fake_creator = MockTwilioClient::FakeCreator.new
      allow(MockTwilioClient::FakeCreator).to receive(:new).and_return fake_creator
      expect(fake_creator).to receive(:create).with({
        from: '+15555551234',
        to: '+15555550009',
        body: "Sign in code for Student Insights: #{login_code}\n\nIf you did not request this, please reply to let us know so we can secure your account!"
      })

      authenticator.send_login_code_if_necessary!
    end

    it 'works for Rich when verifying log output for development' do
      log = log_for_mock_twilio_client
      authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.rich_districtwide)
      authenticator.send_login_code_if_necessary!
      expect(log.output).to include('from: +15555551234')
      expect(log.output).to include('to: +15555550009')
      expect(log.output).to include("Sign in code for Student Insights: #{login_code}")
      expect(log.output).to include('If you did not request this, please reply to let us know so we can secure your account!')
    end

    it 'logs to Rails that a message was sent to Rich, without any sensitive information (separate from MockTwilioClient logging in dev/demo)' do
      rails_logger = LogHelper::RailsLogger.new
      authenticator = MultifactorAuthenticator.new(pals.rich_districtwide, logger: rails_logger)
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.rich_districtwide)
      authenticator.send_login_code_if_necessary!

      expect(rails_logger.output).to include('MultifactorAuthenticator#send_login_code_via_sms! sent Twilio message')
      expect(rails_logger.output).not_to include(login_code)
      expect(rails_logger.output).not_to include(pals.rich_districtwide.email)
      expect(rails_logger.output).not_to include('+15555551234')
      expect(rails_logger.output).not_to include('+15555550009')
    end

    it 'works for Harry when verifying params sent to mocked MailGun' do
      authenticator = MultifactorAuthenticator.new(pals.shs_harry_housemaster)
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.shs_harry_housemaster)

      mock_client = MailgunHelper::MockClient.new
      allow(MailgunHelper::MockClient).to receive(:new).and_return mock_client
      expect(mock_client).to receive(:post_email).once.with('https://api:fake-mailgun-api-key@api.mailgun.net/v3/fake-mailgun-domain/messages', {
        from: 'Student Insights <security@studentinsights.org>',
        to: 'harry@demo.studentinsights.org',
        subject: 'Sign in code for Student Insights',
        html: [
          "<html><body><pre style='font: monospace; font-size: 12px;'>",
          "Sign in code for Student Insights: #{login_code}\n\n",
          "If you did not request this, please forward to security@studentinsights.org so we can secure your account!",
          "</pre></body></html>"
        ].join('')
      }).and_return 342

      authenticator.send_login_code_if_necessary!
    end

    it 'works for Harry when verifying log output for development' do
      log = LogHelper::FakeLog.new
      mock_client = MailgunHelper::MockClient.new
      allow(mock_client).to receive(:logger).and_return(log)
      allow(MailgunHelper::MockClient).to receive(:new).and_return mock_client

      authenticator = MultifactorAuthenticator.new(pals.shs_harry_housemaster)
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.shs_harry_housemaster)
      authenticator.send_login_code_if_necessary!

      expect(log.output).to include('from: Student Insights <security@studentinsights.org>')
      expect(log.output).to include('to: harry@demo.studentinsights.org')
      expect(log.output).to include("Sign in code for Student Insights: #{login_code}")
      expect(log.output).to include('If you did not request this, please forward to security@studentinsights.org so we can secure your account!')
    end

    it 'logs to Rails that a message was sent to Harry, without any sensitive information (separate from MailgunHelper::MockClient logging in dev/demo)' do
      rails_logger = LogHelper::RailsLogger.new
      authenticator = MultifactorAuthenticator.new(pals.shs_harry_housemaster, logger: rails_logger)
      login_code = LoginTests.peek_at_correct_multifactor_code(pals.shs_harry_housemaster)
      authenticator.send_login_code_if_necessary!

      expect(rails_logger.output).to include('MultifactorAuthenticator#send_login_code_via_email! sent message to Mailgun.')
      expect(rails_logger.output).not_to include(login_code)
      expect(rails_logger.output).not_to include(pals.shs_harry_housemaster.email)
      expect(rails_logger.output).not_to include('+1555')
    end
  end

  describe '#create_totp!' do
    it 'loads a different secret for each user' do
      secrets = enabled_educators.map {|educator| MultifactorAuthenticator.new(educator).send(:create_totp!).secret }
      expect(secrets.uniq.size).to eq enabled_educators.size
    end
  end

  describe '#enable_multifactor! (private)' do
    it 'works' do
      authenticator = MultifactorAuthenticator.new(pals.shs_sofia_counselor)
      config = authenticator.send(:enable_multifactor!)
      expect(config.valid?).to eq true
    end

    it 'raises if already enabled' do
      authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      expect { authenticator.send(:enable_multifactor!) }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe '#provision (private)' do
    it 'makes a pretty ansi QR code for the generated secret' do
      authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      ansi_qr = authenticator.send(:provision)
      expect(ansi_qr).to include("\033[47m")
      expect(ansi_qr).to include("\033[40m")
      expect(ansi_qr.size).to be >= 30000
    end

    it 'returns nil when not enabled' do
      authenticator = MultifactorAuthenticator.new(pals.shs_sofia_counselor)
      expect(authenticator.send(:provision)).to eq nil
    end
  end

  describe 'totp library itself, works the way we expect with a specific drift_behind value' do
    let!(:drift_behind) { 30 }

    it 'works at start of window' do
      totp = ROTP::TOTP.new('base32secret3232')
      now = Time.at(1474590600+0).utc
      expect(now.to_s).to eq '2016-09-23 00:30:00 UTC'
      expect(now.to_i % 30).to eq 0

      login_code = totp.at(now)
      expect(login_code).to eq('250939')

      # just test 'em all +/- 120 seconds in both directions and verify behavior
      valid_n_seconds_after = (-120..120).select do |n|
        totp.verify(login_code, drift_behind: drift_behind, at: now+n).present?
      end
      expect(valid_n_seconds_after.minmax).to eq [0, 59]
    end

    it 'works at end of window' do
      totp = ROTP::TOTP.new('base32secret3232')
      now = Time.at(1474590600+29).utc
      expect(now.to_s).to eq '2016-09-23 00:30:29 UTC'
      expect(now.to_i % 30).to eq 29

      login_code = totp.at(now)
      expect(login_code).to eq('250939')

      # just test 'em all +/- 120 seconds in both directions and verify behavior
      valid_n_seconds_after = (-120..120).select do |n|
        totp.verify(login_code, drift_behind: drift_behind, at: now+n).present?
      end
      expect(valid_n_seconds_after.minmax).to eq [-29, 30]
    end

    it 'range makes sense, regardless of where in the time window' do
      totp = ROTP::TOTP.new('base32secret3232')

      # simulate doing this at a range of times
      times_within_window = (-130..130).map do |n|
        Time.at(1474590600+n).utc
      end

      # for each time, get the login code
      # then compute how many seconds afterward that code remains valid for
      # and how long beforehand it would be valid (eg, based on authenticator
      # app heuristics)
      max_n_seconds_before = []
      max_n_seconds_after = []
      times_within_window.each do |time|
        login_code = totp.at(time)
        valid_at_n_seconds = (-70..70).select do |n|
          totp.verify(login_code, drift_behind: drift_behind, at: time+n).present?
        end
        max_n_seconds_after << valid_at_n_seconds.max
        max_n_seconds_before << valid_at_n_seconds.min
      end

      # whatever the initial time was, the login code should remains valid
      # afterward for a limited time period that is in the range we expect,
      # and would be valid for only a limited period beforehand (eg, heuristics
      # in the authenticator app)
      expect(max_n_seconds_before.minmax).to eq [-29, 0]
      expect(max_n_seconds_after.minmax).to eq [30, 59]
    end
  end
end
