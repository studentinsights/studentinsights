class StudentSectionGradesImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def initialize(*)
    super
    @student_lasid_map = Student.pluck(:local_id,:id).to_h

    @section_number_map = Section.joins(course: :school)
                                 .select("sections.id", "sections.section_number", "sections.term_local_id", "schools.local_id as school_local_id", "courses.course_number as section_course_number")
                                 .map { |item| [item.section_number + "|" + item.term_local_id + "|" + item.school_local_id + "|"  + item.section_course_number, item.id] }
                                 .to_h

  end

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STUDENT_AVERAGES_IMPORT', nil)
  end

  def data_transformer
    CsvTransformer.new(headers:%w[section_number student_local_id school_local_id course_number term_local_id grade])
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def import_row(row)
    student_id = @student_lasid_map[row[:student_local_id]] if row[:student_local_id]
    section_id = @section_number_map["#{row[:section_number]}|#{row[:term_local_id]}|#{row[:school_local_id]}|#{row[:course_number]}"]

    student_section_assignment = StudentSectionGradeRow.new(row, student_id, section_id).build
    if student_section_assignment
      student_section_assignment.save!
    else
      log.write("Student Section Grade Import invalid row: #{row}")
    end
  end
end
