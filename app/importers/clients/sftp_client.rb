# These are keys into ENV
class SftpClient < Struct.new :override_env, :env_host, :env_user, :env_password, :env_key_data

  def self.for_x2(override_env = nil)
    new(
      override_env,
      'SIS_SFTP_HOST',
      'SIS_SFTP_USER',
      nil,
      'SIS_SFTP_KEY'
    )
  end

  def self.for_star(override_env = nil)
    new(
      override_env,
      'STAR_SFTP_HOST',
      'STAR_SFTP_USER',
      'STAR_SFTP_PASSWORD',
      nil
    )
  end

  def download_file(remote_file_name)
    Dir.mkdir('tmp/data_download/') unless File.exist?('tmp/data_download/')

    local_filename = File.join('tmp/data_download/', remote_file_name.split("/").last)
    local_file = File.open(local_filename, 'w')
    sftp_session.download!(remote_file_name, local_file.path)

    local_file
  end

  def dir_entries(*args)
    sftp_session.dir.entries(*args)
  end

  private
  # This returns an object that will reveal secure data if printed
  def sftp_session
    raise "SFTP information missing" unless sftp_info_present?

    if @sftp_session.nil?
      proxy = Net::SSH::Proxy::HTTP.new(
        'quotaguard_proxy_host', ENV.fetch('QUOTAGUARDSTATIC_URL')
      )

      @sftp_session = Net::SFTP.start(host, user, auth_mechanism, proxy: proxy)
    end

    @sftp_session
  end

  def sftp_info_present?
    user.present? && host.present? && (password.present? || key_data.present?)
  end

  # secrets
  def auth_mechanism
    return { password: password } if password.present?
    { key_data: key_data } if key_data.present?
  end

  # avoid storing sensitive data from ENV as an instance variable, read it on-demand
  def env(key)
    if key.nil?
      nil
    elsif override_env.present?
      override_env[key]
    else
      ENV[key]
    end
  end

  def user
    env(env_user)
  end

  def host
    env(env_host)
  end

  def password
    env(env_password)
  end

  def key_data
    env(env_key_data)
  end
end
