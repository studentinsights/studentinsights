class StarRiskLevel < Struct.new :student_assessment
  delegate :performance_level, :percentile_rank, :growth_percentile,
    :instructional_reading_level, :grade, to: :student_assessment

  def risk_level_3_cutoff; 10 end
  def risk_level_2_cutoff; 30 end
  def risk_level_0_cutoff; 85 end
  def percentile_warning_level; 40 end

  def risk_level
    if percentile_rank.present?
      if percentile_rank < risk_level_3_cutoff
        3
      elsif percentile_rank < risk_level_2_cutoff
        2
      elsif percentile_rank > risk_level_0_cutoff
        0
      else
        1
      end
    end
  end

  # Warning flags for variables in roster view
  def percentile_warning?
    if percentile_rank.present?
      percentile_rank < percentile_warning_level
    end
  end

  def level_warning?
    if instructional_reading_level.present?
      -1 >= instructional_reading_level.to_f - grade.to_f
    end
  end
end
