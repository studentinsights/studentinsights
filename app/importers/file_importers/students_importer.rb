class StudentsImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @syncer = ::RecordSyncer.new(log: @log)

    reset_counters!
  end

  def import
    return unless remote_file_name

    log('Downloading...')
    streaming_csv = download_csv

    log('Starting loop...')
    reset_counters!
    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index > 0 && index % 1000 == 0
    end

    log('Done loop.')
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@skipped_because_registration_date_nil_or_in_future_count: #{@skipped_because_registration_date_nil_or_in_future_count}")
    log("@setting_nil_homeroom_because_not_active_count: #{@setting_nil_homeroom_because_not_active_count}")
    log("@nil_homeroom_count: #{@nil_homeroom_count}")
    log("@could_not_match_homeroom_name_count: #{@could_not_match_homeroom_name_count}")

    # We don't want to remove old `Student` records, since notes and other records
    # refence them, and this is important information we want to preserve even if
    # a `Student` is no longer attending the district.  We'll remove these records in
    # a separate retention policy sweep.
    log('Skipping the call to  RecordSyncer#delete_unmarked_records, to preserve references to older Student records.')
    log("RecordSyncer#stats: #{@syncer.stats}")
  end

  private
  def reset_counters!
    @skipped_from_school_filter = 0
    @skipped_because_registration_date_nil_or_in_future_count = 0
    @setting_nil_homeroom_because_not_active_count = 0
    @nil_homeroom_count = 0
    @could_not_match_homeroom_name_count = 0
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

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STUDENTS_IMPORT', nil)
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    if !filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    # Match student records
    maybe_homeroom_id = match_homeroom_id(row)
    maybe_student = StudentRow.new(row, maybe_homeroom_id, school_ids_dictionary, @log).build

    # We might be able to remove this or move this to a narrower one-field check
    # before doing the match process for the record, since trying to set a model
    # like this should raise a validation.
    if maybe_student.try(:registration_date_in_future)
      @skipped_because_registration_date_nil_or_in_future_count += 1
      return
    end

    # Sync records
    @syncer.validate_mark_and_sync!(maybe_student)
  end

  # Match Homeroom record, but this is just a match - don't create if
  # it doesn't exist.
  # Homeroom records are created by `EducatorsImporter`
  def match_homeroom_id(row)
    if row[:homeroom].nil?
      @nil_homeroom_count += 1
      return nil
    end

    # KR: not sure if this is still needed, we might be able to remove this
    if row[:enrollment_status] != 'Active'
      @setting_nil_homeroom_because_not_active_count += 1
      return nil
    end

    # Homeroom is guaranteed by index to be unique on {name, school}
    homeroom = Homeroom.find_by({
      name: row[:homeroom],
      school_id: school_ids_dictionary[row[:school_local_id]]
    })
    if homeroom.nil?
      @could_not_match_homeroom_name_count += 1
      return nil
    end

    homeroom
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentsImporter: #{text}"
  end
end
