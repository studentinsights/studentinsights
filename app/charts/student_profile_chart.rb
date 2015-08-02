class StudentProfileChart < Struct.new :student
  include FindDataForStudentProfile

  def prepare(assessments, score)
    return if assessments.blank?
    assessments.map { |s| [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.send(score)] }
  end

  def chart_data
    {
      attendance_series_absences: attendance_series_absences(attendance_events_by_school_year),
      attendance_series_tardies: attendance_series_tardies(attendance_events_by_school_year),
      attendance_events_school_years: attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: behavior_events_school_years,
      star_series_math_percentile: prepare(star_math_results(student.assessments), :percentile_rank),
      star_series_reading_percentile: prepare(star_reading_results(student.assessments), :percentile_rank),
      mcas_series_math_scaled: prepare(mcas_math_results(student.assessments), :scale_score),
      mcas_series_ela_scaled: prepare(mcas_ela_results(student.assessments), :scale_score),
      mcas_series_math_growth: prepare(mcas_math_results(student.assessments), :growth_percentile),
      mcas_series_ela_growth: prepare(mcas_ela_results(student.assessments), :growth_percentile)
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
