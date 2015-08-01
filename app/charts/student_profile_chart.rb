class StudentProfileChart < Struct.new :student

  def prepare(family, subject, score)
    unless family.is_a?(MissingAssessmentFamily) || subject.is_a?(MissingAssessmentSubject)
      student.assessments.where(
        assessment_family_id: family.id,
        assessment_subject_id: subject.id
      ).order(date_taken: :asc).map do |s|
        [ s.date_taken.year, s.date_taken.month, s.date_taken.day, s.send(score) ]
      end
    end
  end

  def chart_data
    {
      attendance_series_absences: attendance_series_absences,
      attendance_series_tardies: attendance_series_tardies,
      attendance_events_school_years: attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: behavior_series_school_years,
      star_series_math_percentile: prepare(AssessmentFamily.star, AssessmentSubject.math, :percentile_rank),
      star_series_reading_percentile: prepare(AssessmentFamily.star, AssessmentSubject.reading, :percentile_rank),
      mcas_series_math_scaled: prepare(AssessmentFamily.mcas, AssessmentSubject.math, :scale_score),
      mcas_series_ela_scaled: prepare(AssessmentFamily.mcas, AssessmentSubject.ela, :scale_score),
      mcas_series_math_growth: prepare(AssessmentFamily.mcas, AssessmentSubject.math, :growth_percentile),
      mcas_series_ela_growth: prepare(AssessmentFamily.mcas, AssessmentSubject.ela, :growth_percentile)
    }
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
