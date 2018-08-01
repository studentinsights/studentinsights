class BehaviorImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @inclusive_date_range = create_inclusive_date_range(options)
    @record_syncer = ::RecordSyncer.new(log: @log)
  end

  def import
    return unless remote_file_name

    streaming_csv = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    log('Starting loop...')
    @skipped_from_school_filter = 0
    @skipped_from_invalid_student_id = 0
    @skipped_old_rows_count = 0
    @invalid_rows_count = 0
    @touched_rows_count = 0

    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index % 10000 == 0
    end

    log('Done loop.')

    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@skipped_from_invalid_student_id: #{@skipped_from_invalid_student_id}")
    log("@skipped_old_rows_count: #{@skipped_old_rows_count}")
    log("@invalid_rows_count: #{@invalid_rows_count}")
    log("@touched_rows_count: #{@touched_rows_count}")

    log("Sync stats: #{@record_syncer.stats}")
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

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_BEHAVIOR_IMPORT', nil)
  end

  def data_transformer
    StreamingCsvTransformer.new(@log)
  end

  def school_filter
    SchoolFilter.new(@school_scope)
  end

  def records_within_scope
    DisciplineIncident
      .joins(:student => :school)
      .where(:schools => {:local_id => @school_scope})
      .where('occurred_at >= ?', @inclusive_date_range.begin)
      .where('occurred_at <= ?', @inclusive_date_range.end)
  end

  def import_row(row)
    if !school_filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    if !within_date_range?(row)
      @skipped_old_rows_count += 1
      return
    end

    student = Student.find_by_local_id(row[:local_id])
    if student.nil?
      @skipped_from_invalid_student_id += 1
      log("skipping, StudentLocalID not found: #{row[:local_id]}")
      return
    end

    maybe_matching_record = matching_insights_record_for_row(row)

    @record_syncer.validate_mark_and_sync!(maybe_matching_record)
    @record_syncer.delete_unmarked_records!(records_within_scope)
  end

  def matching_insights_record_for_row(row)
    behavior_event = BehaviorRow.new(row, student.id).build

    if !behavior_event.invalid?
      @invalid_rows_count += 1
      return nil
    end
  end

  def within_date_range?(row)
    date = row[:event_date]
    date >= @inclusive_date_range.begin && date <= @inclusive_date_range.end
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "BehaviorImporter: #{text}"
  end
end
