class SftpClient
  def self.for_x2(settings_hash = ENV)
    new(credentials: {
      user: settings_hash.fetch('SIS_SFTP_USER'),
      host: settings_hash.fetch('SIS_SFTP_HOST'),
      key_data: settings_hash.fetch('SIS_SFTP_KEY')
    })
  end

  def self.for_star(settings_hash = ENV)
    new(credentials: {
      user: settings_hash.fetch('STAR_SFTP_USER'),
      host: settings_hash.fetch('STAR_SFTP_HOST'),
      password: settings_hash.fetch('STAR_SFTP_PASSWORD')
    })
  end

  attr_reader :credentials

  def initialize(options = {})
    # Credentials take the form of a hash with the following keys:
    # user:, host:, (password: or key_data:)
    @credentials = options[:credentials]
  end

  def read_file(remote_file_name)
    sftp_session.download!(remote_file_name).encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
  end

  def sftp_session
    if sftp_info_present?
      auth = {}
      auth[:password] = @credentials[:password] if @credentials[:password].present?
      auth[:key_data] = @credentials[:key_data] if @credentials[:key_data].present?
      Net::SFTP.start(@credentials[:host], @credentials[:user], auth)
    else
      raise "SFTP information missing"
    end
  end

  def sftp_info_present?
    @credentials[:user].present? &&
    @credentials[:host].present? &&
    (@credentials[:password].present? || @credentials[:key_data].present?)
  end
end
