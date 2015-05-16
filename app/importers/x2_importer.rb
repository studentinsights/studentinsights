module X2Importer

  def sftp_info_present?
    ENV['SIS_SFTP_HOST'].present? &&
    ENV['SIS_SFTP_USER'].present? &&
    ENV['SIS_SFTP_KEY'].present?
  end

  def import_from_x2
    if sftp_info_present?
      Net::SFTP.start(
        ENV['SIS_SFTP_HOST'],
        ENV['SIS_SFTP_USER'],
        key_data: ENV['SIS_SFTP_KEY'],
        keys_only: true,
        ) do |sftp|
        # For documentation on Net::SFTP::Operations::File, see
        # http://net-ssh.github.io/sftp/v2/api/classes/Net/SFTP/Operations/File.html
        sftp.file.open(export_file_name, "r") do |f|
          parse_for_import(f)
        end
      end
    else
      raise "SFTP information missing"
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
