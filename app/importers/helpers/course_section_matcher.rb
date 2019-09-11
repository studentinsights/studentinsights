# For Somerville high school courses and sections
class CourseSectionMatcher
  def initialize(options = {})
    @log = options.fetch(:log)
    @time_now = options.fetch(:time_now, Time.now)
  end

  # Finds the course and section records in Insights that matches
  # what the export describes.  nil if no matches.
  #
  # Returns [course, section, nil]
  # if invalid course, [nil, nil, nil]
  # if invalid section, [course, nil, nil]
  # if warnings, [course, section, :school_year]
  def find_course_and_section(school_ids_dictionary, row)
    course = find_course(school_ids_dictionary, row)
    if course.nil?
      return [nil, nil, nil]
    end

    section = find_section(row, course)
    if section.nil?
      return [course, nil, nil]
    end

    # On imports, the school year should match what insights thinks the school year
    # is, except for during the rollover transition in the summer.  Warn but continue.
    if section.to_insights_school_year != SchoolYear.to_school_year(@time_now)
      return [course, section, :school_year_warning]
    end

    [course, section, nil]
  end

  private
  def find_course(school_ids_dictionary, row)
    return nil unless row[:course_number]

    school_local_id = row[:school_local_id]
    school_id = school_ids_dictionary[school_local_id]

    Course.find_by({
      course_number: row[:course_number],
      school_id: school_id
    })
  end

  def find_section(row, course)
    return nil if row[:section_number].nil?
    return nil if row[:term_local_id].nil?
    return nil if row[:district_school_year].nil?

    Section.find_by({
      course_id: course.id,
      section_number: row[:section_number],
      term_local_id: row[:term_local_id],
      district_school_year: row[:district_school_year]
    })
  end
end
