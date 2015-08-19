class McasRiskLevel < Struct.new :student_assessment
  delegate :performance_level, :growth_percentile, to: :student_assessment

  def risk_level
    if performance_level.present?
      if performance_level == "W" || performance_level == "F"
        3
      elsif performance_level == "NI"
        2
      elsif performance_level == "P"
        1
     elsif performance_level == "A"
        0
      end
    end
  end

end
