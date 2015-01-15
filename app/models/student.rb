class Student < ActiveRecord::Base

  RISK_CATEGORY_DEFAULTS = {
    "A" => "Low",
    "P+" => "Low",
    "P" => "Low",
    "NI" => "Medium",
    "F" => "High",
    "W" => "High"
  }

  def self.sort_by_math_risk

    math_risk = { "Low" => [], "Medium" => [], "High" => [] }

    Student.find_each do |s|
      if s.math_performance.present?

        risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
        if math_risk[risk_category].present? || math_risk[risk_category] == []
          math_risk[risk_category] = math_risk[risk_category] << s
        end
      end
    end
    math_risk

  end
end
