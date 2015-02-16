class SMS

  def self.send_pin(to, pin)
    $twilio_client.messages.create(
      from: ENV["TWILIO_PHONE"],      # Different values for test and prod
      to: to,
      body: "Your Homeroom PIN is #{pin}."
    )
  end

end