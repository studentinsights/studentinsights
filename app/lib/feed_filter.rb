class FeedFilter
  def initialize(educator)
    @educator = educator
  end

  # Apply any student filters by role, if they are enabled.
  def filter_for_educator(students)
    filters = [
      CounselorFilter.new(@educator),
      HouseFilter.new(@educator)
    ]

    filtered_students = students
    filters.each do |filter|
      filtered_students = filter.filter(filtered_students) if filter.enabled?
    end

    filtered_students
  end

  private
  # For filtering base on the student's counselor field.
  class CounselorFilter
    def initialize(educator)
      @educator = educator
    end

    # Check global env flag, then per-educator flag.
    def enabled?
      return false unless PerDistrict.new.enable_counselor_based_feed?
      return false unless EducatorLabel.has_static_label?(@educator.id, 'use_counselor_based_feed')
      true
    end

    def filter(students)
      students.select {|student| is_counselor_for?(student) }
    end

    private
    def is_counselor_for?(student)
      return false if student.counselor.nil?
      CounselorNameMapping.has_mapping? @educator.id, student.counselor.downcase
    end
  end

  class HouseFilter
    def initialize(educator)
      @educator = educator
    end

    # Check global env flag, then per-educator flag.
    def enabled?
      return false unless PerDistrict.new.enable_housemaster_based_feed?
      return false unless EducatorLabel.has_static_label?(@educator.id, 'use_housemaster_based_feed')
      true
    end

    def filter(students)
      students.select {|student| is_housemaster_for?(student) }
    end

    private
    def is_housemaster_for?(student)
      return false if student.house.nil? || student.house == ''
      HouseEducatorMapping.has_mapping? @educator.id, student.house.downcase
    end
  end
end
