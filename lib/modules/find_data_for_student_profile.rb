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

  def star(student)
    star_math = student.ordered_star_math
    star_reading = student.ordered_star_reading
    if !star_math.is_a?(MissingStudentAssessmentCollection) && \
       !star_reading.is_a?(MissingStudentAssessmentCollection)
      student.ordered_star_math + student.ordered_star_reading
    else
      star_math || star_reading || MissingStudentAssessmentCollection.new
    end
  end

  def dibels(student)
    student_assessments.dibels.find_by_student(student).order_or_missing
  end

  def access(student)
    student_assessments.access.find_by_student(student).last_or_missing
  end

  def attendance_events_by_school_year
    student.attendance_events.sort_by_school_year
  end

  def discipline_incidents_by_school_year
    student.discipline_incidents.sort_by_school_year
  end

  def attendance_events_school_years
    attendance_events_by_school_year.keys.reverse
  end

  def behavior_events_school_years
    discipline_incidents_by_school_year.keys.reverse
  end

end
