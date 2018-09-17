class StudentSectionGradesImporter

  # Most of our file importer classes match to a SQL file in the /x2_export folder.
  # Somerville IT uses the SQL to export data  nightly, and Rails imports nightly.

  # The StudentSectionGradesImporter is a bit different. It has no matching SQL export
  # file, because its CSV gets delivered by Aspen nightly, using a custom routine
  # they created on their back end.

  # The CSV output of the custom Aspen routine doesn't include headers, so we
  # specify them explicitly here:

  CSV_HEADERS = [
    'section_number',
    'student_local_id',
    'school_local_id',
    'course_number',
    'term_local_id',
    'grade',
  ]

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    @student_lasid_map = Student.pluck(:local_id,:id).to_h
    @section_number_map = Section.joins(course: :school)
                                 .select("sections.id", "sections.section_number", "sections.term_local_id", "schools.local_id as school_local_id", "courses.course_number as section_course_number")
                                 .map { |item| [item.section_number + "|" + item.term_local_id + "|" + item.school_local_id + "|"  + item.section_course_number, item.id] }
                                 .to_h
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
    PerDistrict.new.fetch_remote_filename('FILENAME_FOR_STUDENT_AVERAGES_IMPORT', nil)
  end

  def data_transformer
    StreamingCsvTransformer.new(@log, headers: CSV_HEADERS)
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(row)
    student_id = @student_lasid_map[row[:student_local_id]] if row[:student_local_id]
    section_id = @section_number_map["#{row[:section_number]}|#{row[:term_local_id]}|#{row[:school_local_id]}|#{row[:course_number]}"]

    student_section_assignment = StudentSectionGradeRow.new(row, student_id, section_id).build
    if student_section_assignment
      student_section_assignment.save!
    else
      @log.puts("Student Section Grade Import invalid row")
    end
  end
end
