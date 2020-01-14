# This importer also creates Homeroom records.
class EducatorsImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_SIS_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      merge: DataFlow::MERGE_UPDATE_IGNORE_UNMARKED,
      options: [
        DataFlow::OPTION_SCHOOL_SCOPE
      ],
      touches: [
        Educator.name,
        Homeroom.name
      ],
      description: 'SIS educator rosters, which also includes homeroom assignments and impacts permissions.'
    })
  end

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @educator_syncer = ::RecordSyncer.new(log: @log, notification_tag: 'EducatorsImporter.educator')
    @homeroom_syncer = ::RecordSyncer.new(log: @log, notification_tag: 'EducatorsImporter.homeroom')
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
    log("@included_because_in_whitelist_count: #{@included_because_in_whitelist_count}")
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@ignored_because_login_or_email_missing_count: #{@ignored_because_login_or_email_missing_count}")
    log("@ignored_special_nil_homeroom_count: #{@ignored_special_nil_homeroom_count}")
    log("@ignored_no_homeroom_count: #{@ignored_no_homeroom_count}")
    log("@ignored_homeroom_because_no_school_count: #{@ignored_homeroom_because_no_school_count}")

    # We don't want to remove old Educator records, since notes and other records
    # refence them, and this is important information we want to preserve even if
    # an Educator is no longer an active employee.  We'll remove those records in
    # a separate retention policy sweep.
    #
    # District authentication systems ultimately control access, and districts managed
    # these two separate systems independently in ways we do not control.  But an additional
    # sanity check on our end is to disallow access if the educator wasn't in the latest
    # export (and alert).
    #
    log('For Educator, RecordSyncer#process_unmarked_records! to set missing_from_last_export...')
    @educator_syncer.process_unmarked_records!(educator_records_within_scope) do |educator, index|
      educator.update!(missing_from_last_export: true)
      @missing_from_last_export_count += 1
    end
    log("Educator RecordSyncer#stats: #{@educator_syncer.stats}")
    log("@missing_from_last_export_count: #{@missing_from_last_export_count}")

    # Preserve Homeroom records that aren't exported any more as well, or
    # are no longer referenced by any educators.
    # This doesn't mark them though and leaves them untouched.
    log('For Homeroom, skipping the call to  RecordSyncer#delete_unmarked_records, to preserve references to older Homeroom records.')
    log("Homeroom RecordSyncer#stats: #{@homeroom_syncer.stats}")
  end

  private
  def reset_counters!
    @included_because_in_whitelist_count = 0
    @skipped_from_school_filter = 0
    @ignored_because_login_or_email_missing_count = 0
    @ignored_special_nil_homeroom_count = 0
    @ignored_no_homeroom_count = 0
    @ignored_homeroom_because_no_school_count = 0
    @missing_from_last_export_count = 0
  end

  def educator_records_within_scope
    # match semantics of SchoolFilter, which treats `nil` as "process everything."
    return Educator.all if @school_scope.nil?

    Educator.joins(:school).where(schools: {local_id: @school_scope})
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
    PerDistrict.new.try_sftp_filename('FILENAME_FOR_EDUCATORS_IMPORT')
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    # Include login_names on whitelist, or filter out based on school
    if is_included_in_whitelist?(row)
      @included_because_in_whitelist_count += 1
    elsif !filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    # Find the matching Educator record if possible.
    # Since there are often records coming from the SIS without email or login_name,
    # count those separately.
    maybe_educator = EducatorRow.new(row, school_ids_dictionary).match_educator_record
    if maybe_educator.nil?
      @ignored_because_login_or_email_missing_count += 1
      return
    end

    # Sync the educator row
    @educator_syncer.validate_mark_and_sync!(maybe_educator)

    # Find the matching Homeroom record if possible and
    # sync the `educator_id` field.
    maybe_homeroom = match_homeroom(row, maybe_educator)
    @homeroom_syncer.validate_mark_and_sync!(maybe_homeroom)
  end

  def is_included_in_whitelist?(row)
    whitelist = PerDistrict.new.educators_importer_login_name_whitelist
    whitelist.include?(row[:login_name])
  end

  # Match existing Homeroom and update reference to Educator.
  def match_homeroom(row, maybe_educator)
    # Special case for NB magic "nil" value
    if PerDistrict.new.is_nil_homeroom_name?(row[:homeroom])
      @ignored_special_nil_homeroom_count += 1
      return nil
    end

    # No homeroom for educator
    if !row.has_key?(:homeroom) || row[:homeroom].nil? || row[:homeroom] == ''
      @ignored_no_homeroom_count += 1
      return nil
    end

    # If no school, can't do match
    school_id = school_ids_dictionary[row[:school_local_id]]
    if school_id.nil?
      @ignored_homeroom_because_no_school_count += 1
      return nil
    end

    # Match Homeroom (guaranteed to be unique on {name, school} by database index)
    homeroom = Homeroom.find_or_initialize_by({
      name: row[:homeroom],
      school_id: school_id
    })

    # Update to reference educator
    educator_id = maybe_educator.try(:id) # might be nil
    homeroom.assign_attributes(educator_id: educator_id)

    homeroom
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "EducatorsImporter: #{text}"
  end
end
