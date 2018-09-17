class CoursesSectionsImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  def import
    return unless remote_file_name

    streaming_csv = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    streaming_csv.each_with_index do |row, index|
      import_row(row) if filter.include?(row[:school_local_id])
    end
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    PerDistrict.new.fetch_remote_filename('FILENAME_FOR_COURSE_SECTION_IMPORT', nil)
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
    if course.school.present?
      if course.save!
        section = SectionRow.new(row, school_ids_dictionary, course.id).build
        section.save
      else
        @log.puts("Course import invalid row")
      end
    else
      @log.puts("Course import invalid row missing school_local_id")
    end
  end

end
