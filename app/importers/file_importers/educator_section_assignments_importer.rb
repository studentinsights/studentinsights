class EducatorSectionAssignmentsImporter

  def initialize(options:)
    @school_local_ids = options.fetch(:school_scope, [])
    @log = options.fetch(:log)
    @syncer = ::RecordSyncer.new(log: @log)
    reset_counters!
  end

  def import
    return log('No remote_file_name, aborting.') unless remote_file_name

    log('Downloading...')
    streaming_csv = download_csv

    log('Starting loop...')
    reset_counters!
    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index % 1000 == 0
    end

    log('Done loop.')
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@invalid_section_count: #{@invalid_section_count}")
    log("@invalid_educator_count: #{@invalid_educator_count}")
    log('')

    log('Calling RecordSyncer#delete_unmarked_records...')
    @syncer.delete_unmarked_records!(records_within_scope)
    log("RecordSyncer stats: #{@syncer.stats}")
  end

  private
  def reset_counters!
    @skipped_from_school_filter = 0
    @invalid_section_count = 0
    @invalid_educator_count = 0
  end

  # What existing Insights records should be updated or deleted from running this import?
  def records_within_scope
    return EducatorSectionAssignment.all if @school_local_ids.nil?

    EducatorSectionAssignment
      .joins(:section => {:course => :school})
      .where(:schools => {:local_id => @school_local_ids})
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
    LoadDistrictConfig.new.remote_filenames.fetch(
      'FILENAME_FOR_EDUCATOR_SECTION_ASSIGNMENT_IMPORT', nil
    )
  end

  def filter
    SchoolFilter.new(@school_local_ids)
  end

  def import_row(row)
    if !filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    maybe_assignment_record = matching_insights_record_for_row(row)
    @syncer.validate_mark_and_sync!(maybe_assignment_record)
  end

  def matching_insights_record_for_row(row)
    section_id = find_section_id(row)
    if section_id.nil?
      @invalid_section_count += 1
      return nil
    end

    educator_id = find_educator_id(row)
    if educator_id.nil?
      @invalid_educator_count += 1
      return nil
    end

    EducatorSectionAssignment.find_or_initialize_by({
      educator_id: educator_id,
      section_id: section_id
    })
  end

  def find_section_id(row)
    return nil if row[:section_number].nil?
    Section.find_by_section_number(row[:section_number]).try(:id)
  end

  def find_educator_id(row)
    return nil if row[:login_name].nil?
    email = PerDistrict.new.from_educator_row_to_email(row)
    Educator.find_by(email: email).try(:id)
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "EducatorSectionAssignmentsImporter: #{text}"
  end
end
