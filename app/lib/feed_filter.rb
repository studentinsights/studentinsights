class FeedFilter
  def initialize(educator)
    @educator = educator
  end

  def by_counselor_caseload(students)
    if use_counselor_based_feed?
      students.select {|student| is_counselor_for?(@educator, student) }
    else
      students
    end
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
