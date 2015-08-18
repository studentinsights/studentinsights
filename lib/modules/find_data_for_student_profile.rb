module FindDataForStudentProfile

  def mcas_math_result(student)
    student.student_assessments.latest_mcas_math
  end

  def mcas_ela_result(student)
    student.student_assessments.latest_mcas_ela
  end

  def mcas_math_results(student)
    student.student_assessments.ordered_mcas_math
  end

  def mcas_ela_results(student)
    student.student_assessments.ordered_mcas_ela
  end

  def star(student)
    student.student_assessments.ordered_star_math + student.student_assessments.ordered_star_reading
  end

  def star_reading_results(student)
    student.student_assessments.ordered_star_reading
  end

  def star_math_results(student)
    student.student_assessments.ordered_star_math
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
