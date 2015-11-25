class StudentSchoolYear < Struct.new :student, :school_year
  delegate :name, to: :school_year

  def student_school_year_assessments
    student.student_assessments.where(school_year_id: school_year.id)
  end

  def student_school_year_attendance_summary
    events = student.attendance_events.where(school_year_id: school_year.id)
    {
      tardies: events.where(tardy: true).size,
      absences: events.where(absence: true).size
    }
  end

  def student_school_year_discipline_incidents
    student.discipline_incidents.where(school_year_id: school_year.id)
  end

  def assessment_events
    {
      mcas_math_result: student_school_year_assessments.latest.by_family_and_subject("MCAS", "Math").first_or_missing,
      mcas_ela_result: student_school_year_assessments.latest.by_family_and_subject("MCAS", "ELA").first_or_missing,
      star: student_school_year_assessments.by_family("STAR").group_by { |result| result.date_taken },
      dibels: student_school_year_assessments.by_family("DIBELS"),
      access: student_school_year_assessments.latest.by_family("ACCESS").first_or_missing
    }
  end

  def attendance_discipline_events
    {
      attendance_events_summary: student_school_year_attendance_summary,
      discipline_incidents: student_school_year_discipline_incidents,
      discipline_incidents_count: student_school_year_discipline_incidents.count
    }
  end

  def events
    assessment_events.merge(attendance_discipline_events)
  end

end
