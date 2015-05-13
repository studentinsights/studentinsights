desc "Connect to remote server to refresh data from Student Information System"

task :connect => :environment do
  Net::SSH.start(
    ENV['SFTP_HOST'],
    ENV['SFTP_USER'],
    key_data: ENV['SFTP_KEY'],
    keys_only: true,
    ) do |ssh|
    channel = ssh.open_channel do |ch|
      result = ssh.exec!("ls -l")
      puts result
    end
  end
end
