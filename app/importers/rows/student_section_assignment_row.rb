class StudentSectionAssignmentRow < Struct.new(:row, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents student section assignments.
  #
  # Expects the following headers:
  #
  #   :local_id, :course_number, :school_local_id, :section_number,
  #   :term_local_id
  #
  # Eventually this will also include the letter grade for graded courses

  def self.build(row)
    new(row).build
  end

  def build
    return if course.nil? || student.nil? || section.nil?

    StudentSectionAssignment.find_or_initialize_by(student: student, section: section)
  end

  def student
    return unless row[:local_id]

    Student.find_by_local_id(row[:local_id])
  end

  def course
    return unless row[:course_number]

    school_local_id = row[:school_local_id]
    school_id = school_ids_dictionary[school_local_id]


    Course.find_by(course_number: row[:course_number], school_id: school_id)
  end

  def section
    return unless row[:section_number]

    Section.find_by(
      section_number: row[:section_number],
      course: course,
      term_local_id: row[:term_local_id]
    )
  end

end
