class AttendanceImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @only_recent_attendance = options.fetch(:only_recent_attendance)
  end

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
    end
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_ATTENDANCE_IMPORT', nil)
  end

  def client
    SftpClient.for_x2
  end

  def data_transformer
    StreamingCsvTransformer.new
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(row)
    return if Time.current - 90.days > row[:event_date]

    AttendanceRow.build(row).save!
  end
end
