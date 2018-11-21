# fragile minimal implementation of `Twilio::REST::Client`
# puts the message and fake id
class MockTwilioClient
  def self.should_use?
    return true if Rails.env.development? || Rails.env.test?
    return true if PerDistrict.new.district_key == 'demo'
    return false
  end

  def initialize(sid, token)
    raise 'invalid sid' if sid.nil?
    raise 'invalid token' if token.nil?
  end

  class FakeMessage
    def sid
      @sid ||= Digest::SHA256.hexdigest(rand().to_s)
    end
  end

  class FakeCreator
    def create(params = {})
      raise 'invalid body' unless params.has_key?(:body)
      raise 'invalid to' unless params.has_key?(:to)
      raise 'invalid from' unless params.has_key?(:from)

      message = FakeMessage.new
      puts '--------------------------'
      puts 'MockTwilioClient created a message!'
      puts "   sid: #{message.sid}"
      puts "  from: #{params[:from]}"
      puts "    to: #{params[:to]}"
      puts "  body: #{params[:body]}"
      puts '--------------------------'
      message
    end
  end

  def messages
    FakeCreator.new
  end
end
