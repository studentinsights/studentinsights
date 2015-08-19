class StudentRiskLevelPresenter < Struct.new :risk_level_value

  def level_as_string
    risk_level_value.nil? ? "N/A" : risk_level_value.to_s
  end

  def css_class_name
    "risk-" + level_as_string.downcase.gsub("/", "")
  end

end
