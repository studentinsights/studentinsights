# Disable view logging
%w{render_template render_partial render_collection}.each do |event|
  ActiveSupport::Notifications.unsubscribe "#{event}.action_view"
end

# Prepend all log lines with tags for the request, and for the session
Rails.application.config.log_tags = [
  # request
  ->(req) {
    "r:#{req.request_id.first(8)}"
  },
  # session
  ->(req) {
    begin
      session_key = Rails.application.config.session_options[:key]
      return nil if session_key.nil?
      session_data = req.cookie_jar.encrypted[session_key]
      return nil if session_data.nil?
      session_id = session_data['session_id']
      return nil if session_id.nil?

      # log hashed value
      seed = ENV.fetch('LOGGING_SEED', ENV['SECRET_KEY_BASE'])
      hashed = Digest::SHA256.hexdigest("#{session_id}-#{seed}")
      "s:#{hashed.first(8)}"
    rescue
      Rollbar.error('raised logging the session identifier')
      nil
    end
  },
  # educator
  ->(req) {
    begin
      session_key = Rails.application.config.session_options[:key]
      return nil if session_key.nil?
      session_data = req.cookie_jar.encrypted[session_key]
      return nil if session_data.nil?
      warden_data = session_data['warden.user.educator.key']
      return nil if warden_data.nil?
      educator_id = warden_data.try(:[], 0).try(:[], 0)
      return nil if educator_id.nil?
      
      # log hashed value
      seed = ENV.fetch('LOGGING_SEED', ENV['SECRET_KEY_BASE'])
      hashed = Digest::SHA256.hexdigest("#{educator_id}-#{seed}")
      "e:#{hashed.first(8)}"
    rescue
      Rollbar.error('raised logging the educator identifier')
      nil
    end
  },
]