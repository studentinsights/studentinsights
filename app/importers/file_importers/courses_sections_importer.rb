class CoursesSectionsImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_SIS_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [
        DataFlow::OPTION_SCHOOL_SCOPE
      ],
      merge: DataFlow::MERGE_UPDATE_IGNORE_UNMARKED, # leave old records be
      touches: [
        Section.name,
        Course.name
      ],
      description: 'SIS course and section descriptions.  These may change over time, and primary keys may be recycled in some circumstances.'
    })
  end

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @courses_syncer = ::RecordSyncer.new(log: @log, notification_tag: 'CoursesSectionsImporter.courses')
    @sections_syncer = ::RecordSyncer.new(log: @log, notification_tag: 'CoursesSectionsImporter.sections')
    reset_counters!
  end

  def import
    reset_counters!

    if remote_file_name.nil?
      log('Aborting, no remote_file_name.')
      return
    end

    log('Downloading...')
    streaming_csv = download_csv()

    log('Starting loop...')
    streaming_csv.each_with_index do |row, index|
      import_row(row)
      if index > 0 && index % 1000 == 0
        log("processed #{index} rows.")
        log("in-progress stats: #{stats.to_json}")
      end
    end
    log('Done loop.')

    log("stats: #{stats.to_json}")

    # Records should be scoped by `district_school_year`, so old records stay
    # as they are. They'll be orphaned over time but remain valid stable references
    # for looking at historical data or changes over time.
    log("courses_syncer#stats: #{@courses_syncer.stats}")
    log('  skipped the call to  RecordSyncer#delete_unmarked_records, to preserve references to older records.')
    log("sections_syncer#stats: #{@sections_syncer.stats}")
    log('  skipped the call to  RecordSyncer#delete_unmarked_records, to preserve references to older records.')
    log('Done.')
  end

  def stats
    {
      ignored_section_row_because_course_was_nil: @ignored_section_row_because_course_was_nil,
      skipped_from_school_filter: @skipped_from_school_filter,
      invalid_course_school_count: @invalid_course_school_count
    }
  end

  private
  def reset_counters!
    @ignored_section_row_because_course_was_nil = 0
    @skipped_from_school_filter = 0
    @invalid_course_school_count = 0
  end

  def remote_file_name
    PerDistrict.new.try_sftp_filename('FILENAME_FOR_COURSE_SECTION_IMPORT')
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

  def school_filter
    SchoolFilter.new(@school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    # Skip based on school filter
    if !school_filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    # sync course first
    maybe_course = match_course(row)
    @courses_syncer.validate_mark_and_sync!(maybe_course)

    # can only sync section if there wa a valid course
    if maybe_course.nil?
      @ignored_section_row_because_course_was_nil += 1
      return
    end

    # sync section
    maybe_section = match_section(row, maybe_course)
    @sections_syncer.validate_mark_and_sync!(maybe_section)
  end

  def match_course(row)
    school_id = school_ids_dictionary[row[:school_local_id]]
    if school_id.nil?
      @invalid_course_school_count += 1
      return nil
    end

    course = Course.find_or_initialize_by({
      course_number: row[:course_number],
      school_id: school_id
    })
    course.assign_attributes(course_description: row[:course_description])
    course
  end

  def match_section(row, course)
    section = Section.find_or_initialize_by({
      section_number: row[:section_number],
      course: course,
      term_local_id: row[:term_local_id],
      district_school_year: row[:district_school_year]
    })
    section.assign_attributes({
      schedule: row[:section_schedule],
      room_number:row[:section_room_number]
    })
    section
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "CoursesSectionsImporter: #{text}"
  end
end
