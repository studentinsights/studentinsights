class StudentProfileChart < Struct.new :student

  def interventions_to_highcharts
    return if student.interventions.blank?
    student.interventions.with_start_and_end_dates.map do |intervention|
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
      if s.grade_equivalent == nil
        [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.percentile_rank]
      else
        [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.percentile_rank, s.grade_equivalent]
      end
    end
  end

  def scale_scores_to_highcharts(student_assessments)
    return if student_assessments.blank?
    student_assessments.map do |s|
      [s.date_taken.year, s.date_taken.month, s.date_taken.day, s.scale_score]
    end
  end

  def chart_data
    data = serialize_student_for_profile_chart(student)
    {
      star_series_math_percentile: percentile_ranks_to_highcharts(data[:star_math_results]),
      star_series_reading_percentile: percentile_ranks_to_highcharts(data[:star_reading_results]),
      next_gen_mcas_mathematics_scaled: scale_scores_to_highcharts(data[:next_gen_mcas_mathematics_results]),
      next_gen_mcas_ela_scaled: scale_scores_to_highcharts(data[:next_gen_mcas_ela_results]),
      mcas_series_math_scaled: scale_scores_to_highcharts(data[:mcas_mathematics_results]),
      mcas_series_ela_scaled: scale_scores_to_highcharts(data[:mcas_ela_results]),
      mcas_series_math_growth: growth_percentiles_to_highcharts(data[:mcas_mathematics_results]),
      mcas_series_ela_growth: growth_percentiles_to_highcharts(data[:mcas_ela_results]),
      interventions: interventions_to_highcharts
    }
  end

  def serialize_student_for_profile_chart(student)
    {
      student: student,
      student_assessments: student.student_assessments,
      star_math_results: student.star_math_results,
      star_reading_results: student.star_reading_results,
      mcas_mathematics_results: student.mcas_mathematics_results,
      mcas_ela_results: student.mcas_ela_results,
      next_gen_mcas_mathematics_results: student.next_gen_mcas_mathematics_results,
      next_gen_mcas_ela_results: student.next_gen_mcas_ela_results,
      interventions: student.interventions
    }
  end
end
