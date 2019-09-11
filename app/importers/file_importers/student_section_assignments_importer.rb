class StudentSectionAssignmentsImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_SIS_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [
        DataFlow::OPTION_SCHOOL_SCOPE
      ],
      merge: DataFlow::MERGE_UPDATE_DELETE_UNMARKED,
      touches: [
        StudentSectionAssignment.name
      ],
      description: 'SIS rosters for student enrollment in sections.'
    })
  end

  def initialize(options:)
    @school_local_ids = options.fetch(:school_scope, [])
    @log = options.fetch(:log)
    @time_now = options.fetch(:time_now, Time.now)

    @student_ids_map = ::StudentIdsMap.new
    @course_section_matcher = ::CourseSectionMatcher.new(log: @log)
    @syncer = ::RecordSyncer.new(log: @log)
    reset_counters!
  end

  def import
    return log('No remote_file_name, aborting.') unless remote_file_name

    log('Downloading...')
    streaming_csv = download_csv

    log('Building student_ids_map...')
    @student_ids_map.reset!
    log("@student_ids_map built with #{@student_ids_map.size} local_id keys")

    log('Building school_ids_dictionary...')
    @school_ids_dictionary = build_school_ids_dictionary
    log("@school_ids_dictionary built with #{@school_ids_dictionary.size} local_id keys")

    log('Starting loop...')
    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index > 0 && index % 1000 == 0
    end
    log('Done loop.')
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@invalid_student_count: #{@invalid_student_count}")
    log("@invalid_course_count: #{@invalid_course_count}")
    log("@invalid_section_count: #{@invalid_section_count}")
    log("@warning_unexpected_district_school_year_count: #{@warning_unexpected_district_school_year_count}")
    log('')

    log('Calling RecordSyncer#delete_unmarked_records...')
    @syncer.delete_unmarked_records!(records_within_scope)
    log("RecordSyncer stats: #{@syncer.stats}")
  end

  private
  def reset_counters!
    @skipped_from_school_filter = 0
    @invalid_student_count = 0
    @invalid_course_count = 0
    @invalid_section_count = 0
    @warning_unexpected_district_school_year_count = 0
  end

  # What existing Insights records should be updated or deleted from running this import?
  def records_within_scope
    return StudentSectionAssignment.all if @school_local_ids.nil?

    StudentSectionAssignment
      .joins(:section => {:course => :school})
      .where(:schools => {:local_id => @school_local_ids})
  end

  def download_csv
    client = SftpClient.for_x2
    data_transformer = StreamingCsvTransformer.new(@log)
    CsvDownloader.new({
      log: @log,
      remote_file_name: remote_file_name,
      client: client,
      transformer: data_transformer
    }).get_data
  end

  def remote_file_name
    PerDistrict.new.try_sftp_filename('FILENAME_FOR_STUDENTS_SECTION_ASSIGNMENT_IMPORT')
  end

  def filter
    SchoolFilter.new(@school_local_ids)
  end

  def build_school_ids_dictionary
    School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    if !filter.include?(row[:school_local_id])
      @skipped_from_school_filter += 1
      return
    end

    maybe_assignment_record = matching_insights_record_for_row(row)
    @syncer.validate_mark_and_sync!(maybe_assignment_record)
  end

  # Matches a row from a CSV export with an existing or new (unsaved) Insights record
  # Returns nil if something about the CSV row is invalid and it can't process the row.
  def matching_insights_record_for_row(row)
    student_id = find_student_id(row)
    if student_id.nil?
      @invalid_student_count += 1
      return nil
    end

    course, section, warning = @course_section_matcher.find_course_and_section(@school_ids_dictionary, row)
    if course.nil?
      @invalid_course_count += 1
      return nil
    elsif section.nil?
      @invalid_section_count += 1
      return nil
    elsif warning == :school_year_warning
      @warning_unexpected_district_school_year_count += 1
    end

    StudentSectionAssignment.find_or_initialize_by({
      student_id: student_id,
      section: section
    })
  end

  def find_student_id(row)
    return nil unless row[:local_id]
    @student_ids_map.lookup_student_id(row[:local_id])
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentSectionAssignmentsImporter: #{text}"
  end
end
