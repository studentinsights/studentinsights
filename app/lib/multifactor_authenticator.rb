class MultifactorAuthenticator
  def initialize(educator, options = {})
    @educator = educator
    @logger = options.fetch(:logger, Rails.logger)
  end

  def is_multifactor_required?
    sms_number.present?
  end

  def is_multifactor_code_valid?(login_code)
    totp = create_totp!
    totp.verify(login_code)
  end

  # Send SMS with login code, if multifactor is required
  def send_sms!
    return nil unless is_multifactor_required?

    login_code = get_login_code()
    message_with_login_code = "Sign in code for Student Insights: #{login_code}.\n\nIf you did not request this, please reply to let us know so we can secure your account!"
    twilio_message = send_twilio_message!(message_with_login_code)
    @logger.info("MultifactorAuthenticator#send_sms! send Twilio message #{twilio_message.sid}")
    twilio_message
  end

  private
  def sms_number
    @sms_number ||= EducatorMultifactorTextNumber.find_by(educator_id: @educator.id).try(:sms_number)
  end

  def send_twilio_message!(message)
    twilio_config = validated_twilio_config!(ENV)
    client = Twilio::REST::Client.new(twilio_config['account_sid'], twilio_config['auth_token'])
    client.messages.create({
      body: message,
      to: sms_number,
      from: twilio_config['sending_number']
    })
  end

  def get_login_code
    totp = create_totp!
    totp.now
  end

  def create_totp!
    rotp_config = validated_rotp_config!(ENV)
    issuer = [
      rotp_config['issuer_seed'],
      PerDistrict.new.district_key,
      Digest::SHA256.hexdigest(@educator.id.to_s)
    ].join(':')
    ROTP::TOTP.new(rotp_config['secret'], issuer: issuer)
  end

  def validated_rotp_config!(env)
    rotp_config = JSON.parse(env.fetch('MULTIFACTOR_AUTHENTICATOR_ROTP_CONFIG_JSON', '{}'))
    raise Exceptions::InvalidConfiguration if rotp_config['issuer_seed'].nil?
    raise Exceptions::InvalidConfiguration if rotp_config['secret'].nil?
    rotp_config
  end

  def validated_twilio_config!(env)
    twilio_config = JSON.parse(env.fetch('TWILIO_CONFIG_JSON', '{}'))
    raise Exceptions::InvalidConfiguration if twilio_config['account_sid'].nil?
    raise Exceptions::InvalidConfiguration if twilio_config['auth_token'].nil?
    raise Exceptions::InvalidConfiguration if twilio_config['sending_number'].nil?
    twilio_config
  end
end
