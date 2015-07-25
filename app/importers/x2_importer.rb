module X2Importer
  include Importer
  include ProgressBar

  # Any class using X2Importer should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row (implemented by handle_row)

  attr_accessor :school, :summer_school_local_ids, :recent_only

  def connect_and_import
    sftp = SftpClient.new({
      user: ENV['SIS_SFTP_HOST'],
      host: ENV['SIS_SFTP_USER'],
      key_data: ENV['SIS_SFTP_KEY']
    }).start
    file = sftp.download!(export_file_name)
    import(file)
  end

  def import(file)
    require 'csv'
    if Rails.env.development?
      n = 0
      number_of_rows = count_number_of_rows(file)
    end

    csv = CSV.new(file, headers: true, header_converters: :symbol, converters: lambda { |h| nil_converter(h) })
    csv.each do |row|
      handle_row(row)
      if Rails.env.development?
        n += 1
        print progress_bar(n, number_of_rows)
      end
    end

    puts if Rails.env.development?
    return csv
  end

  def nil_converter(value)
    value == '\N' ? nil : value
  end
end
