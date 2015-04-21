class RiskAnalyzer < Struct.new(:scope)

  def high_risk
    scope.select { |s| s.high_risk? }
  end

  def medium_risk
    scope.select { |s| s.medium_risk? }
  end

  def low_risk
    scope.select { |s| s.low_risk? }
  end

  def by_category
    { "High" => high_risk, "Medium" => medium_risk, "Low" => low_risk }
  end

end