class EdPlanAccommodationsImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_SIS_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      merge: DataFlow::MERGE_UPDATE_DELETE_UNMARKED,
      options: [
        DataFlow::OPTION_SCHOOL_SCOPE,
        DataFlow::OPTION_IDIOSYNCRATIC
      ],
      touches: [
        EdPlanAccommodation.name
      ],
      description: 'Specific accommodation information about 504 plans'
    })
  end

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
    log("@invalid_ed_plan_key: #{@invalid_ed_plan_key}")

    log('Calling #delete_unmarked_records...')
    @syncer.delete_unmarked_records!(records_within_scope)
    log("Sync stats: #{@syncer.stats}")
    nil
  end

  private
  def reset_counters!
    @skipped_from_school_filter = 0
    @skipped_from_student_local_id_filter = 0
    @inconsistent_student_references_count = 0
    @invalid_ed_plan_key = 0
  end

  # Take param, or download it
  def read_or_fetch_csv
    if @file_text.nil?
      filename = PerDistrict.new.try_sftp_filename('FILENAME_FOR_ED_PLAN_ACCOMMODATIONS_IMPORT')
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
    maybe_accommodation = match_accommodation(row)
    @syncer.validate_mark_and_sync!(maybe_accommodation)
  end

  def match_accommodation(row)
    # We don't use this to match per se, but still use it as a filter
    # in case the references aren't all consistent.
    student_id = @matcher.find_student_id(row[:student_local_id])
    return nil if student_id.nil?

    # There has to be a reference to a valid ed plan already imported.
    ed_plan_id = @matcher.find_ed_plan_id(row[:iac_sep_oid])
    if ed_plan_id.nil?
      @invalid_ed_plan_key += 1
      return nil
    end

    # Consistency check
    if student_id != EdPlan.find(ed_plan_id).student_id
      @inconsistent_student_references_count += 1
      return nil
    end

    accommodation = EdPlanAccommodation.find_or_initialize_by({
      iac_oid: row[:iac_oid] # primary key
    })
    accommodation.assign_attributes({
      ed_plan_id: ed_plan_id,
      iac_oid: row[:iac_oid],
      iac_sep_oid: row[:iac_sep_oid],
      iac_description: row[:iac_description],
      iac_field: row[:iac_field],
      iac_last_modified: parsed_timestamp(row[:iac_last_modified])
    })

    @matcher.count_valid_row
    accommodation
  end

  def records_within_scope
    EdPlanAccommodation.all
      .joins(:ed_plan => {:student => :school})
      .where(:schools => {:local_id => @school_local_ids})
  end

  def parsed_timestamp(value)
    return nil if value.nil?
    milliseconds = value.to_i
    Time.at(milliseconds / 1000)
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "EdPlanAccommodationsImporter: #{text}"
  end
end
