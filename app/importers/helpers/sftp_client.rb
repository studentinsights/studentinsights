require 'fileutils'

# These are keys into ENV
class SftpClient < Struct.new :override_env, :env_host, :env_user, :env_password, :env_key_data, :options

  def self.for_x2(override_env = nil, options = {})
    new(
      override_env,
      'SIS_SFTP_HOST',
      'SIS_SFTP_USER',
      nil,
      'SIS_SFTP_KEY',
      options
    )
  end

  def self.for_star(override_env = nil, options = {})
    new(
      override_env,
      'STAR_SFTP_HOST',
      'STAR_SFTP_USER',
      'STAR_SFTP_PASSWORD',
      nil,
      options
    )
  end

  # Open connection, download file to local disk, close connection.
  # Without scoping connection, it may stay open on remote box even when
  # the Heroku dyno is killed (depending on that server's SSH config, like
  # `ClientAliveInterval).
  def download_file(remote_file_name)
    FileUtils.mkdir_p(local_download_folder)
    local_filename = File.join(local_download_folder, File.basename(remote_file_name))
    local_file = File.open(local_filename, 'w')
    with_sftp_session do |sftp_session|
      sftp_session.download!(remote_file_name, local_file.path)
      check_freshness!(sftp_session, remote_file_name)
    end
    local_file
  end

  private
  def local_download_folder
    options.fetch(:unsafe_local_download_folder, Rails.root.join(File.join('tmp', 'data_download/')))
  end

  # Send to Rollbar if the freshness of the file is not what was expected.
  # Can be configured with `options`
  def check_freshness!(sftp_session, remote_file_name)
    return nil unless options.fetch(:check_freshness, true)

    within_n_days = options.fetch(:modified_within_n_days, 3)
    time_now = options.fetch(:time_now, Time.now)
    threshold_time = time_now - within_n_days.days
    sftp_session.lstat(remote_file_name) do |response|
      mtime = Time.at(response.data[:attrs].mtime)
      if mtime < threshold_time
        basename = File.basename(remote_file_name)
        Rollbar.error("SftpClient#check_freshness! failed for remote file, basename: #{basename}, last modified: #{mtime.to_i}")
      end
    end
    nil
  end

  # Always open connection, execute, and then close after each call.
  def with_sftp_session(&block)
    raise 'SFTP information missing' unless sftp_info_present?
    Net::SFTP.start(host, user, auth_mechanism) do |sftp_session|
      block.call(sftp_session)
    end
    nil
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
