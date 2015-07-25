module X2Importer
  include Importer
  include ProgressBar

  # Any class using X2Importer should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row; takes row as only argument

  attr_accessor :school, :summer_school_local_ids, :recent_only

  def initialize(options = {})
    @school = options[:school]
    @recent_only = options[:recent_only]
    @summer_school_local_ids = options[:summer_school_local_ids]    # For importing only summer school students
  end

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
    csv = CSV.new(file, headers: true, header_converters: :symbol, converters: lambda { |h| nil_converter(h) })
    number_of_rows, n = count_number_of_rows(file), 0 if Rails.env.development?

    csv.each do |row|
      if @school.present?
        import_if_in_school_scope(row)
      elsif @summer_school_local_ids.present?
        import_if_in_summer_school(row)
      else
        import_row row
      end
      n += 1 if Rails.env.development?
      print progress_bar(n, number_of_rows) if Rails.env.development?
    end
    puts if Rails.env.development?
    return csv
  end

  def nil_converter(field_value)
    if field_value == '\N'
      nil
    else
      field_value
    end
  end
end
