# For Somerville high school courses and sections
class CourseSectionMatcher
  def find_course(row)
    return nil unless row[:course_number]

    school_local_id = row[:school_local_id]
    school_id = @school_ids_dictionary[school_local_id]

    Course.find_by(course_number: row[:course_number], school_id: school_id)
  end

  def find_section(row, course)
    return nil if row[:section_number].nil?
    return nil if row[:term_local_id].nil?
    return nil if row[:district_school_year].nil?

    Section.find_by({
      course: course,
      section_number: row[:section_number],
      term_local_id: row[:term_local_id],
      district_school_year: row[:district_school_year]
    })
  end
end