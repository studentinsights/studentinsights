class StudentProfileChart < Struct.new :student

  def chart_data
    {
      attendance_series_absences: attendance_series_absences,
      attendance_series_tardies: attendance_series_tardies,
      attendance_events_school_years: attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: behavior_series_school_years,
      star_series_math_percentile: star_series_math_percentile,
      star_series_reading_percentile: star_series_reading_percentile,
      mcas_series_math_scaled: mcas_series_math_scaled,
      mcas_series_ela_scaled: mcas_series_ela_scaled,
      mcas_series_math_growth: mcas_series_math_growth,
      mcas_series_ela_growth: mcas_series_ela_growth
    }
  end

  def star_series_math_percentile
    student.assessments.where(
      assessment_family_id: AssessmentFamily.star.id,
      assessment_subject_id: AssessmentSubject.math.id
    ).order(date_taken: :asc).map do |s|
      [ s.date_taken.year, s.date_taken.month, s.date_taken.day, s.percentile_rank ]
    end
  end

  def star_series_reading_percentile
    student.assessments.where(
      assessment_family_id: AssessmentFamily.star.id,
      assessment_subject_id: AssessmentSubject.reading.id
    ).order(date_taken: :asc).map do |s|
      [ s.date_taken.year, s.date_taken.month, s.date_taken.day, s.percentile_rank ]
    end
  end

  def mcas_series_math_scaled
    student.assessments.where(
      assessment_family_id: AssessmentFamily.mcas.id,
      assessment_subject_id: AssessmentSubject.math.id
    ).order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.scale_score ]
    end
  end

  def mcas_series_ela_scaled
    student.assessments.where(
      assessment_family_id: AssessmentFamily.star.id,
      assessment_subject_id: AssessmentSubject.ela.id
    ).order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.scale_score ]
    end
  end

  def mcas_series_math_growth
    student.assessments.where(
      assessment_family_id: AssessmentFamily.mcas.id,
      assessment_subject_id: AssessmentSubject.math.id
    ).order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.growth_percentile ]
    end
  end

  def mcas_series_ela_growth
    student.assessments.where(
      assessment_family_id: AssessmentFamily.mcas.id,
      assessment_subject_id: AssessmentSubject.ela.id
    ).order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.growth_percentile ]
    end
  end

  def attendance_series_absences
    student.attendance_events.sort_by_school_year.values.map { |v| v.select(:absence).size }.reverse
  end

  def attendance_series_tardies
    student.attendance_events.sort_by_school_year.values.map { |v| v.select(:tardy).size }.reverse
  end

  def attendance_events_school_years
    student.attendance_events.sort_by_school_year.keys.reverse
  end

  def behavior_series
    student.discipline_incidents.sort_by_school_year.values.map { |v| v.size }.reverse
  end

  def behavior_series_school_years
    student.discipline_incidents.sort_by_school_year.keys.reverse
  end

end
