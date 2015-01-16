class Student < ActiveRecord::Base
  belongs_to :room, counter_cache: true

  RISK_CATEGORY_DEFAULTS = {
    "A" => "Low",
    "P+" => "Low",
    "P" => "Low",
    "NI" => "Medium",
    "F" => "High",
    "W" => "High"
  }

  RISK_CATEGORY_OPTION_1 = {
    "A" => "Low",
    "P+" => "Low",
    "P" => "Low",
    "NI" => "Low",
    "F" => "High",
    "W" => "High"
  }

  RISK_CATEGORY_OPTION_2 = {
    "A" => "Low",
    "P+" => "Low",
    "P" => "Low",
    "NI" => "High",
    "F" => "High",
    "W" => "High"
  }

  def self.default_sort_by_math

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

  def self.sort(subject, lower_cutoff, upper_cutoff)

    math_risk = { "Low" => [], "Medium" => [], "High" => [] }

    Student.find_each do |s|
      if s.math_performance.present?

        if # condition  
          risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
        elsif # condition
          risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
        else 
          risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
        end

        if math_risk[risk_category].present? || math_risk[risk_category] == []
          math_risk[risk_category] = math_risk[risk_category] << s
        end
      end
    end
    math_risk

  end

end
