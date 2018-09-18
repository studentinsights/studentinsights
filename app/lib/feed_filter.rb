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
      if filter.should_use?
        filtered_students = filtered_students.select {|student| filter.keep?(student) }
      end
    end

    filtered_students
  end

  private
  # For filtering base on the student's counselor field.
  class CounselorFilter
    def initialize(educator)
      @educator = educator
    end

    def should_use?
      return false unless PerDistrict.new.enable_counselor_based_feed?
      EducatorLabel.has_static_label?(@educator.id, 'use_counselor_based_feed')
    end

    def keep?(student)
      return false if student.counselor.nil?
      CounselorNameMapping.has_mapping? @educator.id, student.counselor.downcase
    end
  end

  class HouseFilter
    def initialize(educator)
      @educator = educator
    end

    def should_use?
      return false unless PerDistrict.new.enable_housemaster_based_feed?
      EducatorLabel.has_static_label?(@educator.id, 'use_housemaster_based_feed')
    end

    def keep?(student)
      return false if student.house.nil? || student.house == ''
      HouseEducatorMapping.has_mapping? @educator.id, student.house.downcase
    end
  end
end
