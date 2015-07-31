class McasRiskLevel < Struct.new :assessment
  delegate :performance_level, :growth_percentile, to: :assessment

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

  def performance_warning_level
    ["W"]
  end

  def growth_warning_level
    40
  end

  # Warning flags for variables in roster view
  def performance_warning?
    if performance_level.present?
      performance_warning_level.include? performance_level
    end
  end

  def growth_warning?
    if growth_percentile.present?
      growth_percentile < growth_warning_level
    end
  end

end
