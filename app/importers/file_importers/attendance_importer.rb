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

    @success_count = 0
    @error_list = []

    @data.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      @log.write("processed #{index} rows.") if index % 1000
    end

    @log.write("\r#{@success_count} valid rows imported, #{@error_list.size} invalid rows skipped\n")
    @error_summary = @error_list.each_with_object(Hash.new(0)) do |error, memo|
      memo[error] += 1
    end
    @log.write("\n\nAttendanceImporter: Invalid rows summary: ")
    @log.write(@error_summary)
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

  def recent_event?(row)
    row[:event_date] > Time.current - 90.days
  end

  def old_event?(row)
    !recent_event?(row)
  end

  def import_row(row)
    return if (@only_recent_attendance && old_event?(row))

    attendance_event = AttendanceRow.build(row)

    if attendance_event.valid?
      attendance_event.save!
      @success_count += 1
    else
      @error_list << attendance_event.errors.messages
    end
  end

end
