module FindDataForStudentProfile

  def mcas_math_result(student)
    assessments.mcas.math.find_by_student(student).last_or_missing
  end

  def mcas_ela_result(student)
    assessments.mcas.ela.find_by_student(student).last_or_missing
  end

  def mcas_math_results(student)
    assessments.mcas.math.find_by_student(student).order_or_missing
  end

  def mcas_ela_results(student)
    assessments.mcas.ela.find_by_student(student).order_or_missing
  end

  def star(student)
    assessments.star.find_by_student(student).order_or_missing
  end

  def star_reading_results(student)
    assessments.star.reading.find_by_student(student).order_or_missing
  end

  def star_math_results(student)
    assessments.star.math.find_by_student(student).order_or_missing
  end

  def dibels(student)
    assessments.dibels.find_by_student(student).order_or_missing
  end

  def access(student)
    assessments.access.find_by_student(student).last_or_missing
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
