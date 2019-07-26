# typed: true
class LogTags
  def request_identifier(req)
    "r:#{req.request_id.first(8)}"
  end

  def session_identifier(req)
    sid = hash_for_logs read_session_data(req).try(:fetch, 'session_id', nil)
    "s:#{sid}"
  end

  def educator_identifier(req)
    eid = hash_for_logs read_educator_id(req)
    "e:#{eid}"
  end

  private
  def read_session_data(req)
    begin
      session_key = Rails.application.config.session_options[:key]
      return nil if session_key.nil?
      req.cookie_jar.encrypted[session_key]
    rescue
      Rollbar.error('read_session_data raised')
      nil
    end
  end

  def read_educator_id(req)
    begin
      session_data = read_session_data(req)
      return nil if session_data.nil?
      warden_data = session_data['warden.user.educator.key']
      return nil if warden_data.nil?
      warden_data.try(:[], 0).try(:[], 0)
    rescue
      Rollbar.error('read_educator_id raised')
      nil
    end
  end

  # Stable identifiers, but reduce risk if logs leak
  # Use nil directy
  def hash_for_logs(value)
    return nil if value.nil?

    seed = ENV.fetch('LOGGING_SEED', ENV['SECRET_KEY_BASE'])
    hashed = Digest::SHA256.hexdigest("#{value}-#{seed}")
    hashed.first(8)
  end
end
