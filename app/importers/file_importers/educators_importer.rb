# This importer also creates Homeroom records.
class EducatorsImporter
  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @syncer = ::RecordSyncer.new(log: @log)
  end

  def import
    return unless remote_file_name

    log('Downloading...')
    streaming_csv = download_csv

    log('Starting loop...')
    @skipped_from_school_filter = 0
    @invalid_rows_count = 0
    @touched_rows_count = 0
    @ignored_special_nil_homeroom_count = 0
    @ignored_no_homeroom_count = 0
    @created_homeroom_count = 0
    streaming_csv.each_with_index do |row, index|
      import_row(row)
    end

    log('Done loop.')
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@invalid_rows_count: #{@invalid_rows_count}")
    log("@touched_rows_count: #{@touched_rows_count}")
    log("@ignored_special_nil_homeroom_count: #{@ignored_special_nil_homeroom_count}")
    log("@ignored_no_homeroom_count: #{@ignored_no_homeroom_count}")
    log("@created_homeroom_count: #{@created_homeroom_count}")

    # We don't want to remove old Educator records, since notes and other records
    # refence them, and this is important information we want to preserve even if
    # an Educator is no longer an active employee.
    log('Skipping the calll to  RecordSyncer#delete_unmarked_records, to preserve references to older Educator records.')
    log("RecordSyncer#stats: #{@syncer.stats}")
  end

  private
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
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_EDUCATORS_IMPORT', nil)
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

    # Find the matching Educator record if possible
    maybe_educator = EducatorRow.new(row, school_ids_dictionary).build

    # Create a new Homeroom if needed, and return the homeroom_id for the
    # educator or nil if none is set.
    homeroom_id = match_or_create_homeroom_id(row)
    if maybe_educator.present?
      maybe_educator.update_attributes(homeroom_id: homeroom_id)
    end

    # Sync the Educator record.
    @syncer.validate_mark_and_sync!(maybe_educator)
  end

  # Match existing Homeroom or create a new one if it doesn't exist.
  # Returns nil if row doesn't have a homeroom set.
  def match_or_create_homeroom_id(row)
    # Special case for NB magic "nil" value
    if PerDistrict.new.is_nil_homeroom_name?(row[:homeroom])
      @ignored_special_nil_homeroom_count += 1
      return nil
    end

    # No homeroom for educator
    if !row[:homeroom]
      @ignored_no_homeroom_count += 1
      return nil
    end

    # Match Homeroom (guaranteed to be uniqe on {name, school} by database index)
    homeroom_attributes = {
      name: row[:homeroom],
      school: educator.school
    }
    existing_homeroom = Homeroom.find_by(homeroom_attributes)
    if existing_homeroom.present?
      return existing_homeroom.id
    end

    # Create if Homeroom doesn't exit
    created_homeroom = Homeroom.create!(homeroom_attributes)
    @created_homeroom_count += 1
    created_homeroom.id
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "EducatorsImporter: #{text}"
  end
end
