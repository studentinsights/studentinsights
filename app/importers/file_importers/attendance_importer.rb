# These reads the student_attendance table from Aspen and syncs it to the Absence and Tardy
# tables.
# See http://aspenhelp.follettlearning.com/570/SI/guides/Attendance.pdf
class AttendanceImporter
  def initialize(options:)
    @log = options.fetch(:log)

    @school_local_ids = options.fetch(:school_scope, [])
    @student_local_ids = options.fetch(:student_local_ids, nil)
    @inclusive_date_range = create_inclusive_date_range(options)

    @student_ids_map = ::StudentIdsMap.new

    @tardy_record_syncer = ::RecordSyncer.new(log: @log)
    @absence_record_syncer = ::RecordSyncer.new(log: @log)
  end

  def import
    return unless remote_file_name

    log('Downloading...')
    streaming_csv = download_csv

    log('Building student_ids_map...')
    @student_ids_map.reset!
    log("@student_ids_map built with #{@student_ids_map.size} local_id keys")

    log('Starting loop...')
    @skipped_from_student_local_id_filter = 0
    @skipped_from_school_filter = 0
    @skipped_old_rows_count = 0
    @skipped_other_rows_count = 0

    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index % 10000 == 0
    end

    log('Done loop.')
    log("@skipped_from_student_local_id_filter: #{@skipped_from_student_local_id_filter}")
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@skipped_old_rows_count: #{@skipped_old_rows_count}")
    log("@skipped_other_rows_count: #{@skipped_other_rows_count}")
    log('')

    log('Calling #delete_unmarked_records for Absence...')
    @absence_record_syncer.delete_unmarked_records!(records_within_scope(Absence))
    log("Absence stats: #{@absence_record_syncer.stats}")
    log('Calling #delete_unmarked_records for Tardy...')
    @tardy_record_syncer.delete_unmarked_records!(records_within_scope(Tardy))
    log("Tardy stats: #{@tardy_record_syncer.stats}")
  end

  private
  def create_inclusive_date_range(options)
    time_window = options.fetch(:time_window, 90.days)
    time_now = options.fetch(:time_now, Time.now)
    skip_old_records = options.fetch(:skip_old_records, false)

    time_window = if skip_old_records then time_window else 20.years end # or max retention policy
    end_date = time_now.beginning_of_day.to_date
    start_date = (end_date - time_window).beginning_of_day.to_date
    InclusiveDateRange.new(start_date, end_date)
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_ATTENDANCE_IMPORT', nil)
  end

  def download_csv
    client = SftpClient.for_x2
    data_transformer = StreamingCsvTransformer.new(@log)
    CsvDownloader.new(
      log: @log,
      remote_file_name: remote_file_name,
      client: client,
      transformer: data_transformer
    ).get_data
  end

  # What existing Insights records should be updated or deleted from running this import?
  def records_within_scope(record_class)
    query = record_class
      .joins(:student => :school)
      .where(:schools => {:local_id => @school_local_ids})
      .where('occurred_at >= ?', @inclusive_date_range.begin)
      .where('occurred_at <= ?', @inclusive_date_range.end)

    # Allow filtering by student_local_id as as well
    if @student_local_ids.present?
      student_ids = @student_local_ids.map do |student_local_id|
        @student_ids_map.lookup_student_id(student_local_id)
      end
      if student_ids != student_ids.compact
        log("not all @student_local_ids could be found, compacting #{@student_local_ids} to #{@student_local_ids.compact}...")
      end
      query.where(student_id: student_ids.compact)
    else
      query
    end
  end

  def school_filter
    SchoolFilter.new(@school_local_ids)
  end

  def within_date_range?(row)
    date = row[:event_date]
    date >= @inclusive_date_range.begin && date <= @inclusive_date_range.end
  end

  def import_row(row)
    # Skip based on school filter
    if !school_filter.include?(row)
      @skipped_from_school_filter += 1
      return
    end

    # Skip old records
    if !within_date_range?(row)
      @skipped_old_rows_count += 1
      return
    end

    # Skip if not absence or tardy
    record_class = attendance_event_class(row)
    if record_class.nil?
      @skipped_other_rows_count += 1
      return
    end

    # Skip based on student filter
    if @student_local_ids.present? && !@student_local_ids.include?(row[:local_id])
      @skipped_from_student_local_id_filter += 1
      return
    end

    # Match with existing record or initialize new one (not saved)
    # Then mark the record and sync the record from CSV to Insights
    maybe_matching_record = matching_insights_record_for_row(row, record_class)
    syncer = get_syncer!(record_class)
    syncer.validate_mark_and_sync!(maybe_matching_record)
  end

  # Matches a row from a CSV export with an existing or new (unsaved) Insights record
  # Returns nil if something about the CSV row is invalid and it can't process the row.
  def matching_insights_record_for_row(row, record_class)
    student_id = @student_ids_map.lookup_student_id(row[:local_id])
    return nil if student_id.nil?

    attendance_event = record_class.find_or_initialize_by(
      occurred_at: row[:event_date],
      student_id: student_id,
    )

    # There are some additional fields for some districts.
    if PerDistrict.new.import_detailed_attendance_fields?
      attendance_event.assign_attributes(
        dismissed: row[:dismissed],
        excused: row[:excused],
        reason: row[:reason],
        comment: row[:comment],
      )
    end

    attendance_event
  end

  def attendance_event_class(row)
    is_absence = row[:absence].to_i == 1
    is_tardy = row[:tardy].to_i == 1

    if is_absence && is_tardy then nil
    elsif is_absence then Absence
    elsif is_tardy then Tardy
    else nil
    end
  end

  def get_syncer!(record_class)
    if record_class == Absence then @absence_record_syncer
    elsif record_class == Tardy then @tardy_record_syncer
    else raise "Code error, unexpected record_class: #{record_class}"
    end
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "AttendanceImporter: #{text}"
  end
end
