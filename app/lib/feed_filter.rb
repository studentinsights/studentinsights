class FeedFilter
  def initialize(educator)
    @educator = educator
  end

  # Apply any student filters by role, if they are enabled.
  def filter_for_educator(students)
    filtered_students = students

    if use_counselor_based_feed?
      filtered_students = by_counselor_caseload(filtered_students)
    end

    filtered_students
  end

  private
  # For filtering base on the student's counselor field.
  def by_counselor_caseload(students)
    students.select {|student| is_counselor_for?(student) }
  end

  # Check global env flag, then per-educator flag.
  def use_counselor_based_feed?
    return false unless PerDistrict.new.enable_counselor_based_feed?
    return false unless EducatorLabel.has_label?(@educator.id, 'use_counselor_based_feed')
    true
  end

  private
  def is_counselor_for?(student)
    return false unless use_counselor_based_feed?
    return false if student.counselor.nil?
    CounselorNameMapping.has_mapping? @educator.id, student.counselor.downcase
  end
end
