class AttendanceDashboard

  def top_5_absence_concerns
    Student.order(absences_count_most_recent_school_year: :desc).limit(5)
  end

  def top_5_tardy_concerns
    Student.order(tardies_count_most_recent_school_year: :desc).limit(5)
  end

end
