module X2Connector

  def connect_to_x2(table)
    require 'csv'

    Net::SFTP.start(
      ENV['SFTP_HOST'],
      ENV['SFTP_USER'],
      key_data: ENV['SFTP_KEY'],
      keys_only: true,
      ) do |sftp|
      sftp.file.open(table, "r") do |f|
        until f.eof?
          CSV.parse(f.readline) do |row|
            parse_row row
          end
        end
      end
    end
  end
end
