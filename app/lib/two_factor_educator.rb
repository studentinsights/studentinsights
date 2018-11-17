class TwoFactorEducator
  def send!(educator_id)
    # get educator number
    educator_number = EducatorTwoFactorNumber.for_educator_id(educator_id)
    if educator_number.nil?
      raise 'no number!'
    end

    # send message with login code for particular educator
    login_code = get_login_code
    puts "  login_code: #{login_code}"
    message_with_login_code = "Sign in code for Student Insights: #{login_code}.\n\nIf you did not request this, please reply to let us know so we can secure your account!"
    puts "  message_with_login_code: #{message_with_login_code}"
    twilio_message = send_text!(educator_number, message_with_login_code)
    puts twilio_message.sid
    twilio_message
  end

  private
  def send_text!(educator_number, message)
    client = Twilio::REST::Client.new(ENV['TWILIO_ACCOUNT_SID'], ENV['TWILIO_AUTH_TOKEN'])
    client.messages.create({
      body: message,
      to: educator_number,
      from: ENV['TWILIO_SENDING_NUMBER']
    })
  end

  def get_login_code
    totp = create_totp
    puts "  totp: #{totp}"
    totp.now
  end

  def create_totp
    issuer = ['student-insights-educator-login', PerDistrict.new.district_key].join(':')
    ROTP::TOTP.new(ENV['ROTP_SECRET'], issuer: issuer)
  end
end
