class Student < ActiveRecord::Base
  belongs_to :room, counter_cache: true
  belongs_to :school
  has_many :student_results, dependent: :destroy
  has_many :assessments, through: :student_results


  FIRST_NAMES = [ "Casey", "Josh", "Judith", "Tae", "Kenn" ]
  LAST_NAMES = [ "Jones", "Pais", "Hoag", "Pak", "Scott" ]

  def sample_name
    FIRST_NAMES.sample + " " + LAST_NAMES.sample
  end

  def self.default_sort_by_math(room)

    math_risk = { "Low" => [], "Medium" => [], "High" => [] }

    if room.present?
        room.students.each do |s|
        if s.math_performance.present?

          risk_category = RiskCategories::RISK_CATEGORY_DEFAULTS[s.math_performance]
          if math_risk[risk_category].present? || math_risk[risk_category] == []
            math_risk[risk_category] = math_risk[risk_category] << s
          end
        end
      end
      math_risk
    else
      []
    end
  end

  def highlight_hispanic_latino
    if self.hispanic_latino 
      "risk"
    else
      "no-risk"
    end
  end

  def highlight_race
    if self.race == "Black" 
      "risk"
    else
      "no-risk"
    end
  end

  def highlight_limited_english
    if self.limited_english == "Limited" || self.limited_english == "Formerly Limited" 
      "risk"
    else
      "no-risk"
    end
  end

  def highlight_low_income
    if self.low_income 
      "risk"
    else
      "no-risk"
    end
  end

  def highlight_sped
    if self.sped 
      "risk"
    else
      "no-risk"
    end
  end

  def highlight_ela_perf
    if self.ela_performance == "NI" || self.ela_performance == "W" 
      "risk"
    else
      "no-risk"
    end
  end

  def highlight_math_perf
    if self.math_performance == "NI" || self.math_performance == "W" 
      "risk"
    else
      "no-risk"
    end
  end

end
