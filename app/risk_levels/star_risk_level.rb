class StarRiskLevel < Struct.new :student_assessment
  delegate :percentile_rank, to: :student_assessment

  def risk_level_3_cutoff; 10 end
  def risk_level_2_cutoff; 30 end
  def risk_level_0_cutoff; 85 end

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

end
