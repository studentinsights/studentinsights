class StudentSectionGradeRow < Struct.new(:row, :student_id, :section_id, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents student section grades.
  #
  # Expects the following headers:
  #
  #   :section_number, :student_local_id, :school_local_id, :course_number,
  #   :term_local_id, :grade
  #

  def self.build(row, student_id, section_id)
    new(row, student_id, section_id).build
  end

  def build
    if student_id && section_id
      student_section_assignment = StudentSectionAssignment.find_by(student_id: student_id,
                                                                    section_id: section_id)
      student_section_assignment.assign_attributes(
        grade_numeric: grade_numeric,
        grade_letter: grade_letter
      ) if student_section_assignment

      student_section_assignment
    end
  end

  def grade_numeric
    return Float(row[:grade].split[0])
  rescue
    nil
  end

  def grade_letter
    return row[:grade].split[1] if row[:grade].split.length > 1
  end
end
