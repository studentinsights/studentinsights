class StudentProfileChart < Struct.new :student
  include FindDataForStudentProfile

  def prepare_student_assessments(assessments, score)
    return if assessments.is_a?(MissingAssessmentCollection) || assessments.is_a?(MissingAssessment)
    assessments.map { |s| [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.send(score)] }
  end

  def prepare_interventions(interventions)
    return if interventions.blank?
    interventions_with_start_and_end_dates = interventions.select do |i|
      i.start_date.present? && i.end_date.present?
    end
    interventions_with_start_and_end_dates.map do |i|
      start_date = i.start_date
      end_date = i.end_date
      {
        start_date: { year: start_date.year, month: start_date.month, day: start_date.day },
        end_date: { year: end_date.year, month: end_date.month, day: end_date.day },
        name: i.name
      }
    end
  end

  def assessments
    student.assessments
  end

  def chart_data
    {
      attendance_series_absences: attendance_series_absences(attendance_events_by_school_year),
      attendance_series_tardies: attendance_series_tardies(attendance_events_by_school_year),
      attendance_events_school_years: attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: behavior_events_school_years,
      star_series_math_percentile: prepare_student_assessments(star_math_results(student), :percentile_rank),
      star_series_reading_percentile: prepare_student_assessments(star_reading_results(student), :percentile_rank),
      mcas_series_math_scaled: prepare_student_assessments(mcas_math_results(student), :scale_score),
      mcas_series_ela_scaled: prepare_student_assessments(mcas_ela_results(student), :scale_score),
      mcas_series_math_growth: prepare_student_assessments(mcas_math_results(student), :growth_percentile),
      mcas_series_ela_growth: prepare_student_assessments(mcas_ela_results(student), :growth_percentile),
      interventions: prepare_interventions(student.interventions.to_a)
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
    discipline_incidents_by_school_year.values.map { |v| v.size }.reverse
  end
end
