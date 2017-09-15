class StudentSectionGradeRow < Struct.new(:row, :student_lasid_map, :section_number_map, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents student section grades.
  #
  # Expects the following headers:
  #
  #   :section_number, :student_local_id, :school_local_id, :course_number,
  #   :term_local_id, :grade
  #
  # Eventually this will also include the letter grade for graded courses

  def self.build(row, student_lasid_map, section_number_map)
    new(row, student_lasid_map, section_number_map).build
  end

  def build
    if student_id && section_id
      student_section_assignment = StudentSectionAssignment.find_or_initialize_by(student_id: student_id,
                                                                                  section_id: section_id)
      student_section_assignment.assign_attributes(
        grade: grade
      )
      student_section_assignment
    end
  end

  def student_id
    return student_lasid_map[row[:student_local_id]] if row[:student_local_id]
  end

  def section_id
    return section_number_map[row[:section_number]] if row[:section_number]
  end

  def grade
    return Integer(row[:grade])
  rescue
    nil
  end
end
