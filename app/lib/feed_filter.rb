class FeedFilter
  def initialize(educator)
    @educator = educator
  end

  # Apply any student filters by role, if they are enabled.
  def filter_for_educator(students)
    filters = [
      CounselorFilter.new(@educator),
      HouseFilter.new(@educator),
      SectionsFilter.new(@educator),
      EnglishLanguageLearnerFilter.new(@educator)
    ]

    filtered_students = students
    filters.each do |filter|
      next unless filter.should_use?
      filtered_students = filtered_students.select {|student| filter.keep?(student) }
    end

    filtered_students
  end

  private
  # For building-level ELL teachers, who have schoolwide access, but only
  # want to see students actively learning English in their feed (on their
  # caseload).
  class EnglishLanguageLearnerFilter
    def initialize(educator)
      @educator = educator
    end

    def should_use?
      return false unless PerDistrict.new.enable_ell_based_feed?
      EducatorLabel.has_static_label?(@educator.id, 'use_ell_based_feed')
    end

    def keep?(student)
      PerDistrict.new.is_student_english_learner_now?(student)
    end
  end

  # Filters by students in sections that a teacher is currently teaching.
  # For HS teachers who need schoolwide access for admin parts of their role (eg, data coordinator,
  # department head), but who also serve as classroom teachers and really want to just focus on those
  # students for most uses cases (eg, the feed, notifications).
  class SectionsFilter
    def initialize(educator)
      @educator = educator
    end

    def should_use?
      return false unless PerDistrict.new.enable_section_based_feed?
      EducatorLabel.has_static_label?(@educator.id, 'use_section_based_feed')
    end

    def keep?(student)
      student.in?(section_students)
    end

    private
    def section_students
      @section_students ||= @educator.section_students.to_a
    end
  end

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
