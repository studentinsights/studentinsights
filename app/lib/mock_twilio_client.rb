# typed: false
# Fragile minimal implementation of `Twilio::REST::Client`
# puts the message and fake id to the logger
class MockTwilioClient
  def self.should_use?
    return true if Rails.env.development? || Rails.env.test?
    return true if ::EnvironmentVariable.is_true('USE_MOCK_TWILIO')
    return true if !ENV.has_key?('TWILIO_CONFIG_JSON')
    return false
  end

  def initialize(sid, token)
    raise Exceptions::InvalidConfiguration if sid.nil?
    raise Exceptions::InvalidConfiguration if token.nil?
  end

  class FakeMessage
    def initialize(params = {})
      raise 'invalid body' unless params.has_key?(:body)
      raise 'invalid to' unless params.has_key?(:to)
      raise 'invalid from' unless params.has_key?(:from)
      @params = params
    end

    def sid
      @sid ||= Digest::SHA256.hexdigest(rand().to_s)
    end
  end

  class FakeCreator
    def create(params = {})
      raise 'invalid body' unless params.has_key?(:body)
      raise 'invalid to' unless params.has_key?(:to)
      raise 'invalid from' unless params.has_key?(:from)

      message = FakeMessage.new(params)
      logger.puts 'MockTwilioClient created a message!'
      logger.puts "   sid: #{message.sid}"
      logger.puts "  from: #{params[:from]}"
      logger.puts "    to: #{params[:to]}"
      logger.puts '--------------------------'
      logger.puts params[:body]
      logger.puts '--------------------------'
      message
    end

    def log(msg)
      logger.puts msg
    end

    def logger
      return STDOUT if Rails.env.development?
      return LogHelper::FakeLog.new if Rails.env.test?
      return STDOUT if PerDistrict.new.district_key == PerDistrict::DEMO
      raise 'invalid' # avoid possibly logging codes in real production site
    end
  end

  def messages
    FakeCreator.new
  end
end
