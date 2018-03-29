class CourseRow < Struct.new(:row, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents courses ignoring the section data. Unfortunately this is run
  # for each section, rather than each course.
  #
  # Expects the following headers:
  #
  #   :course_number, :course_description, :school_local_id,
  #   :section_number, :term_local_id, :section_schedule,
  #   :section_room_number

  def self.build(row)
    new(row).build
  end

  def build
    course = Course.find_or_initialize_by(course_number: row[:course_number], school_id: school_rails_id)
    course.course_description = row[:course_description]
    return course
  end

  def school_local_id
    row[:school_local_id]
  end

  def school_rails_id
    school_ids_dictionary[school_local_id] if school_local_id.present?
  end
end
