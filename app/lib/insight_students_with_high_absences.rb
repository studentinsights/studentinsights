class InsightStudentsWithHighAbsences
  def self.time_threshold_capped_to_school_year(time_now, days_back)
    time_threshold = time_now - days_back
    if SchoolYear.to_school_year(time_threshold) < SchoolYear.to_school_year(time_now)
      SchoolYear.first_day_of_school_for_time(time_now)
    else
      time_threshold
    end
  end

  def initialize(educator, options = {})
    @educator = educator
    @authorizer = Authorizer.new(@educator)
    @include_excused_absences = options.fetch(:include_excused_absences, false)
  end

  # Returns a list of all students that the educator has access
  # to that have a high number of absences, but haven't been
  # commented on in Insights yet.  This information may not be directly
  # actionable for all teachers (eg, ninth grade math teachers) but
  # for SST team members, principals and APs, redirect, and K8
  # classroom teachers, the intended actions are to talk with
  # the student, parent, or refer for SST.
  #
  # time_threshold and absences_threshold are both inclusive ("greater
  # than or equal to")
  #
  # This method returns hashes that are the shape of what is needed
  # in the product.
  def students_with_high_absences_json(time_now, time_threshold, absences_threshold)
    students = @authorizer.authorized do
      # Exclude students in younger grades like PreK since attendance isn't mandatory.
      # This means there's less consistent attendance from families, and it's less
      # of a priority to follow-up for schools.
      students_to_consider = Student.active.where.not(grade: ['TK', 'PPK', 'PK'])

      # Filter students to match what they see in their feed (eg, HS counselors
      # only see students on their caseload).
      FeedFilter.new(@educator).filter_for_educator(students_to_consider)
    end
    student_ids = students.map(&:id)

    # Absences by student in the time period.
    absence_count_pairs = absence_counts_for_students(student_ids, time_threshold, absences_threshold)

    # Query for uncommented students, then filter out students with
    # high absences who have been commented on.
    commented_student_ids = recently_commented_student_ids(student_ids, time_threshold)
    uncommented_pairs = absence_count_pairs.select do |pair|
      !commented_student_ids.include?(pair[:student].id)
    end

    # Sort and serialize
    sorted_students_json(uncommented_pairs)
  end

  private
  # An array of hashes with [{:student, :count}]
  def absence_counts_for_students(student_ids, time_threshold, absences_threshold)
    excused_values = if @include_excused_absences then [true, false, nil] else [false, nil] end
    absence_count_map = Absence
      .includes(:student)
      .where(student_id: student_ids)
      .where(excused: excused_values)
      .where('occurred_at >= ?', time_threshold)
      .group(:student)
      .count
    pairs = absence_count_map.map do |student, count|
      { student: student, count: count }
    end
    pairs.select do |pair|
      pair[:count] >= absences_threshold
    end
  end

  # Students who've been commented on in Insights recently (for any reason)
  # This includes any kind of comment since we don't want folks to
  # enter notes inaccurately as "SST Meetings" when they aren't really, just to
  # make this list seem in better shape.
  def recently_commented_student_ids(student_ids, time_threshold)
    recent_notes = EventNote
      .where(is_restricted: false)
      .where(student_id: student_ids)
      .where('recorded_at >= ?', time_threshold)
    recent_notes.map(&:student_id).uniq
  end

  # Returns JSON for the product about the student, along
  # with the count of absences.
  def sorted_students_json(pairs)
    sorted_pairs = pairs.sort_by do |pair|
      [-1 * pair[:count], pair[:student].last_name]
    end
    sorted_pairs.map do |pair|
      student = pair[:student]
      {
        count: pair[:count],
        student: student.as_json({
          :only => [:id, :email, :first_name, :last_name, :grade, :house]
        })
      }
    end
  end
end
