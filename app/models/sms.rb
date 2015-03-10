class SMS

  def self.send_pin(to, pin)

    if Rails.env.test?
      sid, auth = ENV["TEST_TWILIO_SID"], ENV["TEST_TWILIO_AUTH_TOKEN"]
    else
      sid, auth = ENV["TWILIO_SID"], ENV["TWILIO_AUTH_TOKEN"]
    end

    @client = Twilio::REST::Client.new sid, auth
    @client.messages.create(
      from: ENV["TWILIO_PHONE"],      # Different values for test and prod
      to: to,
      body: "Your Homeroom PIN is #{pin}."
    )
  end

end