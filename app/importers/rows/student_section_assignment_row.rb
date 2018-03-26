class StudentSectionAssignmentRow < Struct.new(:row, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents student section assignments.
  KEYS = [:local_id, :course_number, :school_local_id, :section_number, :term_local_id]

  def self.build(row)
    new(row).build
  end

  def is_valid?
    KEYS == row.keys
  end

  def build
    return nil unless is_valid?

    if student and section
      student_section_assignment = StudentSectionAssignment.find_or_initialize_by(student: student,
                                                                                section: section)
      return student_section_assignment
    end
  end

  def student
    return Student.find_by_local_id(row[:local_id]) if row[:local_id]
  end

  def section
    course = lookup_course
    return Section.find_by_section_number(row[:section_number]) if row[:section_number]
  end

  def lookup_course
    school_rails_id = school_ids_dictionary[row[:school_local_id]]
    return nil unless school_rails_id.present?
    courses = Course.where({
      course_number: row[:course_number],
      school_id: school_rails_id
    })
    if courses.size > 1
      nil
    else

    end
  end
end
