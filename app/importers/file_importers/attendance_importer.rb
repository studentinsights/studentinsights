class AttendanceImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @skip_old_records = options.fetch(:skip_old_records)
    @time_now = options.fetch(:time_now, Time.now)

    @student_ids_map = ::StudentIdsMap.new
  end

  def import
    return unless remote_file_name

    log('Downloading...')
    streaming_csv = CsvDownloader.new(
      log: @log,
      remote_file_name: remote_file_name,
      client: client,
      transformer: data_transformer
    ).get_data

    log('Building student_ids_map...')
    @student_ids_map.reset!
    log("@student_ids_map built with #{@student_ids_map.size} local_id keys")

    log('Starting loop...')
    @skipped_from_school_filter = 0
    @skipped_old_rows_count = 0
    @skipped_other_rows_count = 0
    @unchanged_rows_count = 0
    @updated_rows_count = 0
    @created_rows_count = 0
    @invalid_rows_count = 0

    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index % 10000 == 0
    end

    log('Done loop.')
    log("StreamingCsvTransformer#stats: #{streaming_csv.stats}")
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@skipped_old_rows_count: #{@skipped_old_rows_count}")
    log("@skipped_other_rows_count: #{@skipped_other_rows_count}")
    log('')
    log("@unchanged_rows_count: #{@unchanged_rows_count}")
    log("@updated_rows_count: #{@updated_rows_count}")
    log("@created_rows_count: #{@created_rows_count}")
    log("@invalid_rows_count: #{@invalid_rows_count}")
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_ATTENDANCE_IMPORT', nil)
  end

  def client
    SftpClient.for_x2
  end

  def data_transformer
    StreamingCsvTransformer.new(@log)
  end

  def school_filter
    SchoolFilter.new(@school_scope)
  end

  def is_old?(row)
    row[:event_date] < @time_now - 90.days
  end

  def import_row(row)
    # Skip based on school filter
    if !school_filter.include?(row)
      @skipped_from_school_filter = @skipped_from_school_filter + 1
      return
    end

    # Skip old records
    if @skip_old_records && is_old?(row)
      @skipped_old_rows_count = @skipped_old_rows_count + 1
      return
    end

    # Skip if not absence or tardy
    if row[:absence].to_i != 1 && row[:tardy].to_i != 1
      @skipped_other_rows_count = @skipped_other_rows_count + 1
      return
    end

    # Find student_id
    student_id = @student_ids_map.lookup_student_id(row[:local_id])
    if student_id.nil?
      @invalid_rows_count = @invalid_rows_count + 1
      return
    end

    # Match with existing record or initialize new one (not saved)
    maybe_attendance_event = AttendanceRow.new(row, student_id).build
    if maybe_attendance_event.nil? || !maybe_attendance_event.valid?
      @invalid_rows_count = @invalid_rows_count + 1
      return
    end

    # See if anything has changed
    if !maybe_attendance_event.changed?
      @unchanged_rows_count = @unchanged_rows_count + 1
      return
    end

    # Save, tracking if it's an update or create
    if maybe_attendance_event.persisted?
      @updated_rows_count = @updated_rows_count + 1
    else
      @created_rows_count = @created_rows_count + 1
    end
    maybe_attendance_event.save!
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "AttendanceImporter: #{text}"
  end
end
