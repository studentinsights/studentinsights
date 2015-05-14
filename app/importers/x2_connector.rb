module X2Connector

  def connect_to_x2
    Net::SFTP.start(
      ENV['SFTP_HOST'],
      ENV['SFTP_USER'],
      key_data: ENV['SFTP_KEY'],
      keys_only: true,
      ) do |sftp|
      # For documentation on Net::SFTP::Operations::File, see
      # http://net-ssh.github.io/sftp/v2/api/classes/Net/SFTP/Operations/File.html
      sftp.file.open(export_file_name, "r") do |f|
        parse_for_import(f)
      end
    end
  end

  def parse_for_import(file)
    require 'csv'
    headers = file.gets.parse_csv.map(&:to_sym)    # Assume headers are first row
    loop do
      next_line = file.gets
      if next_line.present?
        row = Hash[headers.zip(next_line.parse_csv)]
        parse_row row
      else break end
    end
  end
end
