class StudentProfileChart < Struct.new :student
  include FindDataForStudentProfile

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
      attendance_series_absences: attendance_series_absences(attendance_events),
      attendance_series_tardies: attendance_series_tardies(discipline_incidents),
      attendance_events_school_years: attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: behavior_events_school_years,
      star_series_math_percentile: prepare(AssessmentFamily.star, AssessmentSubject.math, :percentile_rank),
      star_series_reading_percentile: prepare(AssessmentFamily.star, AssessmentSubject.reading, :percentile_rank),
      mcas_series_math_scaled: prepare(AssessmentFamily.mcas, AssessmentSubject.math, :scale_score),
      mcas_series_ela_scaled: prepare(AssessmentFamily.mcas, AssessmentSubject.ela, :scale_score),
      mcas_series_math_growth: prepare(AssessmentFamily.mcas, AssessmentSubject.math, :growth_percentile),
      mcas_series_ela_growth: prepare(AssessmentFamily.mcas, AssessmentSubject.ela, :growth_percentile)
    }
  end

  def attendance_series_absences(sorted_attendance_events)
    only_absence_events = sorted_attendance_events.values.map do |events|
      events.select { |event| event.absence }
    end
    only_absence_events.map { |events| events.size }.reverse
  end

  def attendance_series_tardies(sorted_attendance_events)
    only_tardy_events = sorted_attendance_events.values.map do |events|
      events.select { |event| event.tardy }
    end
    only_tardy_events.map { |events| events.size }.reverse
  end

  def behavior_series
    discipline_incidents.values.map { |v| v.size }.reverse
  end
end
