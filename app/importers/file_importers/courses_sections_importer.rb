class CoursesSectionsImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    reset_counters!
  end

  def import
    return unless remote_file_name

    log('Starting loop...')
    reset_counters!

    streaming_csv = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    streaming_csv.each_with_index do |row, index|
      import_row(row) if filter.include?(row[:school_local_id])
    end

    log('Done loop.')
    log("@invalid_course_school_count: #{@invalid_course_school_count}")
    log("@invalid_course_count: #{@invalid_course_count}")
    log("@invalid_section_count: #{@invalid_section_count}")
  end

  private
  def reset_counters!
    @invalid_course_school_count = 0
    @invalid_course_count = 0
    @invalid_section_count = 0
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    PerDistrict.new.try_sftp_filename('FILENAME_FOR_COURSE_SECTION_IMPORT')
  end

  def data_transformer
    StreamingCsvTransformer.new(@log)
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
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

end
