class Student < ActiveRecord::Base
  belongs_to :room, counter_cache: true
  belongs_to :school

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

  def self.with_mcas_data
    Student.where.not(ela_scaled: nil)
      .where.not(ela_performance: nil)
      .where.not(ela_growth: nil)
      .where.not(math_scaled: nil)
      .where.not(math_performance: nil)
      .where.not(math_growth: nil)
  end 


  def self.with_demo_data
    Student.where.not(new_id: nil)
      .where.not(grade: nil)
      .where.not(hispanic_latino: nil)
      .where.not(race: nil)
      .where.not(limited_english: nil)
      .where.not(low_income: nil)
  end

  def self.with_demo_and_mcas_data
    Student.with_demo_data & Student.with_mcas_data
  end
  
  def has_access_data?
    self.access_progress.present? && self.access_growth.present? && self.access_performanc.present?
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
