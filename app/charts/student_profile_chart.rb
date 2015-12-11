class StudentProfileChart < Struct.new :data

  def interventions_to_highcharts
    return if data[:interventions].blank?
    data[:interventions].with_start_and_end_dates.map do |intervention|
      intervention.to_highcharts
    end
  end

  def growth_percentiles_to_highcharts(student_assessments)
    return if student_assessments.blank?
    student_assessments.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.growth_percentile]
    end
  end

  def percentile_ranks_to_highcharts(student_assessments)
    return if student_assessments.blank?
    student_assessments.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.percentile_rank]
    end
  end

  def scale_scores_to_highcharts(student_assessments)
    return if student_assessments.blank?
    student_assessments.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.scale_score]
    end
  end

  # v We need to reverse series that have school years as their x-axes so that they
  #   appear on the chart in ascending instead of descending order.
  #   Time axes on charts need to go from least recent to most recent, as opposed
  #   to the CSV export which reads vertically downwards, most recent to least.

  def reverse_for_highcharts(series)
    return if series.blank?
    series.reverse
  end

  def chart_data
    {
      star_series_math_percentile: percentile_ranks_to_highcharts(data[:star_math_results]),
      star_series_reading_percentile: percentile_ranks_to_highcharts(data[:star_reading_results]),
      mcas_series_math_scaled: scale_scores_to_highcharts(data[:mcas_math_results]),
      mcas_series_ela_scaled: scale_scores_to_highcharts(data[:mcas_ela_results]),
      mcas_series_math_growth: growth_percentiles_to_highcharts(data[:mcas_math_results]),
      mcas_series_ela_growth: growth_percentiles_to_highcharts(data[:mcas_ela_results]),
      interventions: interventions_to_highcharts,
      behavior_series: reverse_for_highcharts(data[:discipline_incidents_by_school_year]),
      behavior_series_school_years: reverse_for_highcharts(data[:school_year_names]),
      attendance_series_absences: reverse_for_highcharts(data[:absences_count_by_school_year]),
      attendance_series_tardies: reverse_for_highcharts(data[:tardies_count_by_school_year]),
      attendance_events_school_years: reverse_for_highcharts(data[:school_year_names])
    }
  end

end
