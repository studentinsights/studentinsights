class StudentProfileChart < Struct.new :data

  def prepare_interventions(interventions)
    return if data[:interventions].blank?
    data[:interventions].with_start_and_end_dates.map do |intervention|
      intervention.to_highcharts
    end
  end

  def to_highcharts_growth_percentile_series(student_assessments)
    return if student_assessments.is_a? MissingStudentAssessmentCollection
    student_assessments.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.growth_percentile]
    end
  end

  def to_highcharts_percentile_rank_series(student_assessments)
    return if student_assessments.is_a? MissingStudentAssessmentCollection
    student_assessments.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.percentile_rank]
    end
  end

  def to_highcharts_scale_score_series(student_assessments)
    return if student_assessments.is_a? MissingStudentAssessmentCollection
    student_assessments.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.scale_score]
    end
  end

  def chart_data
    {
      attendance_series_absences: attendance_series_absences(data[:attendance_events_by_school_year]),
      attendance_series_tardies: attendance_series_tardies(data[:attendance_events_by_school_year]),
      attendance_events_school_years: data[:attendance_events_school_years],
      behavior_series: behavior_series,
      behavior_series_school_years: data[:behavior_events_school_years],
      star_series_math_percentile: to_highcharts_percentile_rank_series(data[:star_math_results]),
      star_series_reading_percentile: to_highcharts_percentile_rank_series(data[:star_reading_results]),
      mcas_series_math_scaled: to_highcharts_scale_score_series(data[:mcas_math_results]),
      mcas_series_ela_scaled: to_highcharts_scale_score_series(data[:mcas_ela_results]),
      mcas_series_math_growth: to_highcharts_growth_percentile_series(data[:mcas_math_results]),
      mcas_series_ela_growth: to_highcharts_growth_percentile_series(data[:mcas_ela_results]),
      interventions: prepare_interventions(data[:interventions].to_a)
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
    data[:discipline_incidents_by_school_year].values.map { |v| v.size }.reverse
  end
end
