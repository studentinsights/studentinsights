class Student < ActiveRecord::Base
  belongs_to :room

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

  def self.sort_by_risk(options = {})

    # TODO: Handle options hash that doesn't have all the variables we need
    lower_cutoff = options["lower_cutoff"].to_i
    upper_cutoff = options["upper_cutoff"].to_i

    math_risk = { "Low" => [], "Medium" => [], "High" => [] }

    Student.find_each do |s|
      if s.math_performance.present?

        if lower_cutoff == 2 && upper_cutoff == 2  
          risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
        elsif lower_cutoff == 3 && upper_cutoff == 3
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
