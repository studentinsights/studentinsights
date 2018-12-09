class EdPlansImporter

  def initialize(options:)
    @log = options.fetch(:log)
    @school_local_ids = options.fetch(:school_scope, [])
    @file_text = options.fetch(:file_text, nil)

    @student_ids_map = ::StudentIdsMap.new
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @syncer = ::RecordSyncer.new(log: @log)
    reset_counters!
  end

  def import
    streaming_csv = read_or_fetch_csv
    if streaming_csv.nil?
      log('Aborting since no CSV found...')
      return
    end

    log('Building student_ids_map...')
    @student_ids_map.reset!
    log("@student_ids_map built with #{@student_ids_map.size} local_id keys")

    log('Starting loop...')
    reset_counters!
    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index % 1000 == 0
    end
    log('Done loop.')
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@skipped_from_student_local_id_filter: #{@skipped_from_student_local_id_filter}")

    log('Calling #delete_unmarked_records...')
    @syncer.delete_unmarked_records!(records_within_scope)
    log("Sync stats: #{@syncer.stats}")
    nil
  end

  private
  def reset_counters!
    @skipped_from_school_filter = 0
    @skipped_from_student_local_id_filter = 0
  end

  # Take param, or download it
  def read_or_fetch_csv
    if @file_text.nil?
      filename = PerDistrict.new.try_sftp_filename('FILENAME_FOR_ED_PLAN_IMPORT')
      return nil if filename.nil?
      @file_text = download_csv_file_text(filename)
    end
    StreamingCsvTransformer.from_text(@log, @file_text)
  end

  def download_csv_file_text(filename)
    log('Downloading file...')
    file = SftpClient.for_x2.download_file(filename)
    File.read(file)
  end

  def school_filter
    SchoolFilter.new(@school_local_ids)
  end

  def import_row(raw_row)
    row = raw_row.to_h.symbolize_keys

    # Skip based on school filter
    if !school_filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    # Skip based on student filter
    if @student_local_ids.present? && !@student_local_ids.include?(row[:student_local_id])
      @skipped_from_student_local_id_filter += 1
      return
    end

    # Match with existing record or initialize new one (not saved)
    # Then mark the record and sync the record from CSV to Insights
    maybe_ed_plan = match_ed_plan(row)
    @syncer.validate_mark_and_sync!(maybe_ed_plan)
  end

  def match_ed_plan(row)
    student_id = @matcher.find_student_id(row[:student_local_id])
    return nil if student_id.nil?

    ed_plan = EdPlan.find_or_initialize_by({
      student_id: student_id,
      sep_oid: row[:sep_oid] # primary key
    })
    ed_plan.assign_attributes({
      sep_oid: row[:sep_oid],
      sep_grade_level: row[:sep_grade_level],
      sep_status: row[:sep_status],
      sep_effective_date: parsed_date(row[:sep_effective_date]),
      sep_review_date: parsed_date(row[:sep_review_date]),
      sep_last_meeting_date: parsed_date(row[:sep_last_meeting_date]),
      sep_district_signed_date: parsed_date(row[:sep_district_signed_date]),
      sep_parent_signed_date: parsed_date(row[:sep_parent_signed_date]),
      sep_end_date: parsed_date(row[:sep_end_date]),
      sep_fieldd_001: row[:sep_fieldd_001],
      sep_fieldd_002: row[:sep_fieldd_002],
      sep_fieldd_003: row[:sep_fieldd_003],
      sep_fieldd_004: row[:sep_fieldd_004],
      sep_fieldd_005: row[:sep_fieldd_005],
      sep_fieldd_006: row[:sep_fieldd_006],
      sep_fieldd_007: row[:sep_fieldd_007],
      sep_fieldd_008: row[:sep_fieldd_008],
      sep_fieldd_009: row[:sep_fieldd_009],
      sep_fieldd_010: row[:sep_fieldd_010],
      sep_fieldd_011: row[:sep_fieldd_011],
      sep_fieldd_012: row[:sep_fieldd_012],
      sep_fieldd_013: row[:sep_fieldd_013],
      sep_fieldd_014: row[:sep_fieldd_014],
      sep_last_modified: parsed_timestamp(row[:sep_last_modified])
    })

    @matcher.count_valid_row
    ed_plan
  end

  def records_within_scope
    EdPlan.all
      .joins(:student => :school)
      .where(:schools => {:local_id => @school_local_ids})
  end

  def parsed_date(text)
    PerDistrict.new.parse_date_during_import(text)
  end

  def parsed_timestamp(value)
    return nil if value.nil?
    milliseconds = value.to_i
    Time.at(milliseconds / 1000)
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "EdPlansImporter: #{text}"
  end
end
