class SftpClient < Struct.new :credentials
  # Credentials take the form of a hash with the following keys:
  # user:, host:, (password: or key_data:)

  def sftp_info_present?
    credentials[:user].present? &&
    credentials[:host].present? &&
    (credentials[:password].present? || credentials[:key_data].present?)
  end

  def start
    if sftp_info_present?
      auth = {}
      auth[:password] = credentials[:password] if credentials[:password].present?
      auth[:key_data] = credentials[:key_data] if credentials[:key_data].present?
      Net::SFTP.start(credentials[:user], credentials[:host], auth)
    else
      raise "SFTP information missing"
    end
  end
end
