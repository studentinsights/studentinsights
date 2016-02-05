class SchoolStudentPresenter < Struct.new(:student)

  def as_json
    student.as_json.merge(
      interventions: student.interventions,
      student_risk_level: student.student_risk_level.as_json,
      discipline_incidents_count: most_recent_school_year.discipline_incidents.count,
      absences_count: most_recent_school_year.absences.count,
      tardies_count: most_recent_school_year.tardies.count,
      homeroom_name: student.try(:homeroom).try(:name)
    )
  end

  def as_json_with_star_reading
    as_json.merge(star_reading_results: student.star_reading_results)
  end

  private

  def most_recent_school_year
    student.most_recent_school_year
  end
end
