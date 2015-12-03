class StudentProfileChart < Struct.new :student

  def prepare_student_assessments(student_assessments, score)
    return if student_assessments.is_a?(MissingStudentAssessmentCollection) || student_assessments.is_a?(MissingStudentAssessment)
    student_assessments.map { |s| [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.send(score)] }
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

  def student_assessments
    student.student_assessments
  end

  def chart_data
    {
      attendance_series_absences: attendance_series_absences(student.attendance_events_by_school_year),
      attendance_series_tardies: attendance_series_tardies(student.attendance_events_by_school_year),
      attendance_events_school_years: student.attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: student.behavior_events_school_years,
      star_series_math_percentile: prepare_student_assessments(student.star_math_results, :percentile_rank),
      star_series_reading_percentile: prepare_student_assessments(student.star_reading_results, :percentile_rank),
      mcas_series_math_scaled: prepare_student_assessments(student.mcas_math_results, :scale_score),
      mcas_series_ela_scaled: prepare_student_assessments(student.mcas_ela_results, :scale_score),
      mcas_series_math_growth: prepare_student_assessments(student.mcas_math_results, :growth_percentile),
      mcas_series_ela_growth: prepare_student_assessments(student.mcas_ela_results, :growth_percentile),
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
    student.discipline_incidents_by_school_year.values.map { |v| v.size }.reverse
  end
end
