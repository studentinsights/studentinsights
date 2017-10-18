class StudentSectionGradesImporter < BaseCsvImporter
  def initialize(*)
    super
    @student_lasid_map = Student.pluck(:local_id,:id).to_h

    @section_number_map = Section.joins(course: :school)
                                 .select("sections.id", "sections.section_number", "sections.term_local_id", "schools.local_id as school_local_id", "courses.course_number as section_course_number")
                                 .map { |item| [item.section_number + "|" + item.term_local_id + "|" + item.school_local_id + "|"  + item.section_course_number, item.id] }
                                 .to_h

  end

  def remote_file_name
    'student_averages_export.txt'
  end

  def data_transformer
    CsvTransformer.new(headers:%w[section_number student_local_id school_local_id course_number term_local_id grade])
  end

  def import_row(row)
    log_processed
    student_id = @student_lasid_map[row[:student_local_id]] if row[:student_local_id]
    section_id = @section_number_map["#{row[:section_number]}|#{row[:term_local_id]}|#{row[:school_local_id]}|#{row[:course_number]}"]

    student_section_assignment = StudentSectionGradeRow.new(row, student_id, section_id).build
    if student_section_assignment
      log_action(student_section_assignment)
      student_section_assignment.save
    else
      log_rejected("Student Section Grade Import invalid row: #{row}")
    end
  end
end
