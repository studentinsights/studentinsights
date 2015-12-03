module FindDataForStudentProfile

  def mcas_math_results(student)
    student.ordered_results_by_family_and_subject("MCAS", "Math")
  end

  def mcas_ela_results(student)
    student.ordered_results_by_family_and_subject("MCAS", "ELA")
  end

  def star_reading_results(student)
    student.ordered_results_by_family_and_subject("STAR", "Reading")
  end

  def star_math_results(student)
    student.ordered_results_by_family_and_subject("STAR", "Math")
  end

  def dibels(student)
    student_assessments.dibels.find_by_student(student).order_or_missing
  end

  def access(student)
    student_assessments.access.find_by_student(student).last_or_missing
  end

  def attendance_events_by_school_year
    school_years = student.student_school_years
                          .includes(:attendance_events)
                          .sort_by { |s| s.name }
                          .reverse
    results_hash = {}
    school_years.map do |s|
      results_hash[s.name] = s.attendance_events
    end
    results_hash
  end

  def discipline_incidents_by_school_year
    school_years = student.student_school_years
                          .includes(:discipline_incidents)
                          .sort_by { |s| s.name }
                          .reverse
    results_hash = {}
    school_years.map do |s|
      results_hash[s.name] = s.discipline_incidents
    end
    results_hash
  end

  def attendance_events_school_years
    attendance_events_by_school_year.keys
  end

  def behavior_events_school_years
    discipline_incidents_by_school_year.keys
  end

end
