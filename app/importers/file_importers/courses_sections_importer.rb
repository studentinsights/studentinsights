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
      if index > 0 && index % 10 == 0
        log("processed #{index} rows.") 
        log("in-progress stats: #{stats.to_json}")
      end
    end
    log('Done loop.')

    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@invalid_course_school_count: #{@invalid_course_school_count}")
    log("@invalid_course_count: #{@invalid_course_count}")
    log("@invalid_section_count: #{@invalid_section_count}")

    # Records should be scoped by `district_school_year`, so old records stay
    # as they are. They'll be orphaned over time but remain valid stable references
    # for looking at historical data or changes over time.
  end

  def stats
    {
      skipped_from_school_filter: @skipped_from_school_filter,
      invalid_course_school_count: @invalid_course_school_count,
      invalid_course_count: @invalid_course_count,
      invalid_section_count: @invalid_section_count
    }
  end

  private
  def reset_counters!
    @skipped_from_school_filter = 0
    @invalid_course_school_count = 0
    @invalid_course_count = 0
    @invalid_section_count = 0
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

    course = CourseRow.new(row, school_ids_dictionary).build
    if course.school.nil?
      @invalid_course_school_count += 1
      return
    end

    if !course.save
      @invalid_course_count += 1
      return
    end

    section = SectionRow.new(row, school_ids_dictionary, course.id).build
    if !section.save
      @invalid_section_count += 1
      return
    end
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "CoursesSectionsImporter: #{text}"
  end
end
