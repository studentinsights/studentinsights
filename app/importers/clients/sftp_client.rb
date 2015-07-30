class SftpClient < Struct.new :credentials, :export_file_name
  # Credentials take the form of a hash with the following keys:
  # user:, host:, (password: or key_data:)

  def fetch_file
    sftp_session.download!(export_file_name).encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
  end

  def sftp_session
    if sftp_info_present?
      auth = {}
      auth[:password] = credentials[:password] if credentials[:password].present?
      auth[:key_data] = credentials[:key_data] if credentials[:key_data].present?
      Net::SFTP.start(credentials[:host], credentials[:user], auth)
    else
      raise "SFTP information missing"
    end
  end

  def sftp_info_present?
    credentials[:user].present? &&
    credentials[:host].present? &&
    (credentials[:password].present? || credentials[:key_data].present?)
  end
end
