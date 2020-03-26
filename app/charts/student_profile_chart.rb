class StudentProfileChart < Struct.new :student

  def chart_data
    mcas_mathematics_results = student.mcas_mathematics_results
    mcas_ela_results = student.mcas_ela_results
    next_gen_mcas_mathematics_results = student.next_gen_mcas_mathematics_results
    next_gen_mcas_ela_results = student.next_gen_mcas_ela_results

    {
      star_series_math_percentile: percentile_ranks_to_highcharts(student.star_math_results),
      star_series_reading_percentile: star_series_reading_percentile,
      next_gen_mcas_mathematics_scaled: scale_scores_to_highcharts(next_gen_mcas_mathematics_results),
      next_gen_mcas_ela_scaled: scale_scores_to_highcharts(next_gen_mcas_ela_results),
      mcas_series_math_scaled: scale_scores_to_highcharts(mcas_mathematics_results),
      mcas_series_ela_scaled: scale_scores_to_highcharts(mcas_ela_results),
      mcas_series_math_growth: growth_percentiles_to_highcharts(mcas_mathematics_results + next_gen_mcas_mathematics_results),
      mcas_series_ela_growth: growth_percentiles_to_highcharts(mcas_ela_results + next_gen_mcas_ela_results),
      interventions: interventions_to_highcharts
    }
  end

  # Factored out for re-use in reader profile (January)
  def star_series_reading_percentile
    percentile_ranks_to_highcharts(student.star_reading_results)
  end

  private
  def percentile_ranks_to_highcharts(star_results)
    return nil unless star_results

    star_results.select(:id, :date_taken, :percentile_rank, :grade_equivalent, :total_time)
  end

  def interventions_to_highcharts
    return if student.interventions.blank?
    student.interventions.with_start_and_end_dates.map do |intervention|
      intervention.to_highcharts
    end
  end

  def growth_percentiles_to_highcharts(student_assessments)
    return if student_assessments.blank?
    student_assessments.sort_by(&:date_taken).select {|a| a.growth_percentile.present? }.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.growth_percentile]
    end
  end

  def scale_scores_to_highcharts(student_assessments)
    return if student_assessments.blank?
    student_assessments.sort_by(&:date_taken).select {|a| a.scale_score.present? }.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.scale_score]
    end
  end
end
