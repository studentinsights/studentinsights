module X2Importer
  # Any class using X2Importer should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row; takes row as only argument

  attr_accessor :school

  def initialize(options = {})
    @school = options[:school]
  end

  def sftp_info_present?
    ENV['SIS_SFTP_HOST'].present? &&
    ENV['SIS_SFTP_USER'].present? &&
    ENV['SIS_SFTP_KEY'].present?
  end

  def connect_to_x2_and_import
    if sftp_info_present?
      Net::SFTP.start(
        ENV['SIS_SFTP_HOST'],
        ENV['SIS_SFTP_USER'],
        key_data: ENV['SIS_SFTP_KEY'],
        keys_only: true,
        ) do |sftp|
        # For documentation on Net::SFTP::Operations::File, see
        # http://net-ssh.github.io/sftp/v2/api/classes/Net/SFTP/Operations/File.html
        file = sftp.download!(export_file_name)
        import(file)
      end
    else
      raise "SFTP information missing"
    end
  end

  def import(file)
    require 'csv'
    csv = CSV.new(file, headers: true, header_converters: :symbol)
    csv.each do |row|
      if @school.present?
        import_if_in_school_scope(row)
      else
        import_row row
      end
    end
    return csv
  end

  def import_if_in_school_scope(row)
    if @school.local_id == row[:school_local_id]
      import_row row
    end
  end
end
