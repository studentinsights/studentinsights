class SftpClient < Struct.new :user, :host, :password, :key_data

  def self.for_x2(settings_hash = ENV)
    new(
      settings_hash.fetch('SIS_SFTP_USER'),
      settings_hash.fetch('SIS_SFTP_HOST'),
      nil,
      settings_hash.fetch('SIS_SFTP_KEY')
    )
  end

  def self.for_star(settings_hash = ENV)
    new(
      settings_hash.fetch('STAR_SFTP_USER'),
      settings_hash.fetch('STAR_SFTP_HOST'),
      settings_hash.fetch('STAR_SFTP_PASSWORD'),
      nil
    )
  end

  def read_file(remote_file_name)
    sftp_session.download!(remote_file_name).encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
  end

  def sftp_session
    raise "SFTP information missing" unless sftp_info_present?
    Net::SFTP.start(host, user, auth_mechanism)
  end

  def sftp_info_present?
    user.present? && host.present? && (password.present? || key_data.present?)
  end

  def auth_mechanism
    return { password: password } if password.present?
    { key_data: key_data } if key_data.present?
  end

end
