class StudentSchoolYearPresenter < Struct.new :student_school_year
  delegate :name, to: :student_school_year

  def events
    {
      mcas_math_result: student_school_year.student_assessments.latest.by_family_and_subject("MCAS", "Math").first_or_missing,
      mcas_ela_result: student_school_year.student_assessments.latest.by_family_and_subject("MCAS", "ELA").first_or_missing,
      star: student_school_year.student_assessments.by_family("STAR").group_by { |result| result.date_taken },
      dibels: student_school_year.student_assessments.by_family("DIBELS").order_or_missing,
      access: student_school_year.student_assessments.latest.by_family("ACCESS").first_or_missing,
      attendance_events_summary:  {
        tardies: student_school_year.attendance_events.where(tardy: true).size,
        absences: student_school_year.attendance_events.where(absence: true).size
      },
      discipline_incidents: student_school_year.discipline_incidents,
      discipline_incidents_count: student_school_year.discipline_incidents.count
    }
  end

end
