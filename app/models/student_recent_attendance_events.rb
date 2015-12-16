class StudentRecentAttendanceEvents < Struct.new :student

  delegate :most_recent_school_year, to: :student

  def absences_count
    return 0 if most_recent_school_year.blank?
    most_recent_school_year.attendance_events.absences_count
  end

  def tardies_count
    return 0 if most_recent_school_year.blank?
    most_recent_school_year.attendance_events.tardies_count
  end

  def update_absences_count
    student.absences_count_most_recent_school_year = self.absences_count
    student.save
  end

  def update_tardies_count
    student.tardies_count_most_recent_school_year = self.tardies_count
    student.save
  end

end
