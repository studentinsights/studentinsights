class StudentSectionGradeRow < Struct.new(:row, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents student section grades.
  #
  # Expects the following headers:
  #
  #   :section_number, :student_local_id, :school_local_id, :course_number, 
  #   :term_local_id, :grade
  #
  # Eventually this will also include the letter grade for graded courses
  
  def self.build(row)
    new(row).build
  end

  def build
    if student and section
      student_section_assignment = StudentSectionAssignment.find_or_initialize_by(student: student,
                                                                                section: section)
      student_section_assignment.assign_attributes(
        grade: row[:grade]
      )
      student_section_assignment
    end
  end

  def student
    return Student.find_by_local_id(row[:student_local_id]) if row[:student_local_id]
  end

  def section
    return Section.find_by_section_number(row[:section_number]) if row[:section_number]
  end

end
