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

  def download_file(remote_file_name)
    Dir.mkdir('tmp/data_download/') unless File.exists?('tmp/data_download/')

    local_filename = File.join('tmp/data_download/', remote_file_name)
    local_file = File.open(local_filename, 'w')
    sftp_session.download!(remote_file_name, local_file.path)

    return local_file
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
