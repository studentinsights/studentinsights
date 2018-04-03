class InsightStudentsWithHighAbsences
  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  # Returns a list of all students that the educator has access
  # to that have a high number of absences, but haven't been
  # commented on in SST yet.  This information may not be directly
  # actionable for all teachers (eg, ninth grade math teachers) but
  # for SST team members, principals and APs, redirect, and K8
  # classroom teachers, the intended actions are to talk with
  # the student, parent, or refer for SST.
  #
  # absences_threshold is "greater than or equal to"
  #
  # This method returns hashes that are the shape of what is needed
  # in the product.
  def students_with_high_absences_json(time_now, time_threshold, absences_threshold)
    # Include all authorized students
    students = @authorizer.authorized { Student.all }
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
    absence_count_map = Absence
      .includes(:student)
      .where(student_id: student_ids)
      .where('occurred_at > ?', time_threshold)
      .group(:student)
      .count
    pairs = absence_count_map.map do |student, count|
      { student: student, count: count }
    end
    pairs.select do |pair|
      pair[:count] >= absences_threshold
    end
  end

  # Students who've been commented on in SST recently
  def recently_commented_student_ids(student_ids, time_threshold)
    recent_notes = EventNote
      .where(is_restricted: false)
      .where(student_id: student_ids)
      .where('recorded_at > ?', time_threshold)
      .where(event_note_type_id: [300])
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
