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
    [pals.uri, pals.rich_districtwide]
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
    it 'is enabled for Uri and Rich' do
      expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_enabled?).to eq true
      expect(MultifactorAuthenticator.new(pals.rich_districtwide).is_multifactor_enabled?).to eq true
    end

    it 'is not enabled for anyone else' do
      (Educator.all - enabled_educators).each do |educator|
        expect(MultifactorAuthenticator.new(educator).is_multifactor_enabled?).to eq false
      end
    end
  end

  describe 'is_multifactor_code_valid?' do
    it 'can verify correct code' do
      authenticator = MultifactorAuthenticator.new(pals.uri)
      login_code = authenticator.send(:get_login_code)
      expect(authenticator.is_multifactor_code_valid?(login_code)).to eq true
    end

    it 'does not work when using codes from another user' do
      rich_authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      rich_login_code = rich_authenticator.send(:get_login_code)
      uri_authenticator = MultifactorAuthenticator.new(pals.uri)
      uri_login_code = uri_authenticator.send(:get_login_code)

      expect(uri_authenticator.is_multifactor_code_valid?(rich_login_code)).to eq false
      expect(rich_authenticator.is_multifactor_code_valid?(uri_login_code)).to eq false
    end

    it 'does not work a second time after code has already been used' do
      authenticator = MultifactorAuthenticator.new(pals.uri)
      login_code = authenticator.send(:get_login_code)
      expect(authenticator.is_multifactor_code_valid?(login_code)).to eq true
      expect(authenticator.is_multifactor_code_valid?(login_code)).to eq false
    end

    it 'stores last_verification_at after successful verification' do
      time_now = Time.parse('2017-03-16T11:12:00.000Z')
      Timecop.freeze(time_now) do
        authenticator = MultifactorAuthenticator.new(pals.uri)
        login_code = authenticator.send(:get_login_code)
        expect(authenticator.is_multifactor_code_valid?(login_code)).to eq true
        expect(EducatorMultifactorConfig.find_by(educator_id: pals.uri.id).last_verification_at.to_i).to eq(time_now.to_i)
      end
    end

    it 'allows drift under 15 seconds' do
      time_now = Time.parse('2017-03-16T11:12:00.000Z')
      login_code = nil
      Timecop.freeze(time_now) { login_code = MultifactorAuthenticator.new(pals.uri).send(:get_login_code) }
      Timecop.freeze(time_now + 30.seconds + 14.seconds) do
        expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?(login_code)).to eq true
      end
    end

    it 'guards against drift of 15 seconds or more' do
      time_now = Time.parse('2017-03-16T11:12:00.000Z')
      login_code = nil
      Timecop.freeze(time_now) { login_code = MultifactorAuthenticator.new(pals.uri).send(:get_login_code) }
      Timecop.freeze(time_now + 30.seconds + 15.seconds) do
        expect(MultifactorAuthenticator.new(pals.uri).is_multifactor_code_valid?(login_code)).to eq false
      end
    end
  end

  describe '#send_login_code_if_necessary! with MockTwilioClient' do
    it 'does nothing when multifactor not enabled' do
      log = log_for_mock_twilio_client
      (Educator.all - enabled_educators).each do |educator|
        authenticator = MultifactorAuthenticator.new(educator)
        authenticator.send_login_code_if_necessary!
        expect(log.output).to eq ''
      end
    end

    it 'does nothing when no SMS number (authenticator app)' do
      log = log_for_mock_twilio_client
      authenticator = MultifactorAuthenticator.new(pals.uri)
      authenticator.send_login_code_if_necessary!
      expect(log.output).to eq ''
    end

    it 'works for Rich when verifying params sent to MockTwilioClient' do
      authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      login_code = authenticator.send(:get_login_code)

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
      login_code = authenticator.send(:get_login_code)
      authenticator.send_login_code_if_necessary!
      expect(log.output).to include('from: +15555551234')
      expect(log.output).to include('to: +15555550009')
      expect(log.output).to include("Sign in code for Student Insights: #{login_code}")
      expect(log.output).to include('If you did not request this, please reply to let us know so we can secure your account!')
    end

    it 'logs to Rails that a message was sent, without any sensitive information' do
      rails_logger = LogHelper::RailsLogger.new
      authenticator = MultifactorAuthenticator.new(pals.rich_districtwide, logger: rails_logger)
      login_code = authenticator.send(:get_login_code)
      authenticator.send_login_code_if_necessary!

      expect(rails_logger.output).to include('MultifactorAuthenticator#send_login_code_via_sms! sent Twilio message')
      expect(rails_logger.output).not_to include(login_code)
      expect(rails_logger.output).not_to include(pals.uri.email)
      expect(rails_logger.output).not_to include('+15555551234')
      expect(rails_logger.output).not_to include('+15555550009')
    end
  end

  describe '#create_totp!' do
    it 'loads a different secret for each user' do
      secrets = enabled_educators.map {|educator| MultifactorAuthenticator.new(educator).send(:create_totp!).secret }
      expect(secrets.uniq.size).to eq enabled_educators.size
    end
  end
end
