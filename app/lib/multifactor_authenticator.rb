class MultifactorAuthenticator
  def initialize(educator, options = {})
    @educator = educator
    @logger = options.fetch(:logger, Rails.logger)
    @twilio_client_class = options.fetch(:twilio_client_class, MockTwilioClient.should_use? ? MockTwilioClient : Twilio::REST::Client)
  end

  def is_multifactor_enabled?
    multifactor_record.try(:sms_number).present?
  end

  # Returns true/false and burns the login_code if it is accepted,
  # returns false if not enabled for the user.
  def is_multifactor_code_valid?(login_code)
    return false unless is_multifactor_enabled?

    totp = create_totp!
    verified_password_timestamp = totp.verify(login_code, {
      after: multifactor_record.last_verification_at,
      drift_behind: 15
    })
    return false if verified_password_timestamp.nil?

    # If we authenticated the user, burn the login_code for this time window
    multifactor_record.update!(last_verification_at: verified_password_timestamp)
    true
  end

  # Send SMS with login code, if multifactor is required
  def send_login_code_via_sms!
    return nil unless is_multifactor_enabled?

    login_code = get_login_code()
    message_with_login_code = "Sign in code for Student Insights: #{login_code}\n\nIf you did not request this, please reply to let us know so we can secure your account!"
    twilio_message = send_twilio_message!(message_with_login_code)
    @logger.info("MultifactorAuthenticator#send_login_code_via_sms! sent Twilio message, sid:#{twilio_message.sid}")
    twilio_message
  end

  private
  def get_login_code
    totp = create_totp!
    totp.now
  end

  def multifactor_record
    @multifactor_record ||= EducatorMultifactorTextNumber.find_by(educator_id: @educator.id)
  end

  def create_totp!
    rotp_config = validated_rotp_config!(ENV)
    issuer = [
      rotp_config['issuer_seed'],
      PerDistrict.new.district_key,
      Digest::SHA256.hexdigest(@educator.id.to_s)
    ].join(':')
    ROTP::TOTP.new(rotp_config['secret_base32'], issuer: issuer)
  end

  def validated_rotp_config!(env)
    rotp_config = JSON.parse(env.fetch('MULTIFACTOR_AUTHENTICATOR_ROTP_CONFIG_JSON', '{}'))
    raise Exceptions::InvalidConfiguration if rotp_config['issuer_seed'].nil?
    raise Exceptions::InvalidConfiguration if rotp_config['secret_base32'].nil?
    rotp_config
  end

  def validated_twilio_config!(env)
    twilio_config = JSON.parse(env.fetch('TWILIO_CONFIG_JSON', '{}'))
    raise Exceptions::InvalidConfiguration if twilio_config['account_sid'].nil?
    raise Exceptions::InvalidConfiguration if twilio_config['auth_token'].nil?
    raise Exceptions::InvalidConfiguration if twilio_config['sending_number'].nil?
    twilio_config
  end

  def send_twilio_message!(message)
    twilio_config = validated_twilio_config!(ENV)
    client = @twilio_client_class.new(twilio_config['account_sid'], twilio_config['auth_token'])
    client.messages.create({
      body: message,
      to: multifactor_record.sms_number,
      from: twilio_config['sending_number']
    })
  end
end
