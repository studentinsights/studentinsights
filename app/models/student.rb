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

  FIRST_NAMES = [ "Casey", "Josh", "Judith", "Tae", "Kenn" ]
  LAST_NAMES = [ "Jones", "Pais", "Hoag", "Pak", "Scott" ]

  def sample_name
    FIRST_NAMES.sample + " " + LAST_NAMES.sample
  end

  def to_tables
    [
      {
        :type => {
          :short => "DEMO",
          :full => "Demographic"
        },
        :data => {
          "New ID" => self.new_id,
          "Grade" => self.grade,          
          "Hispanic/Latino" => self.hispanic_latino,
          "Race" => self.race,
          "Limited English" => self.limited_english, 
          "Low Income" => self.low_income
        }
      },
      {
        :type => {
          :short => "MCAS",
          :full => "MCAS"
        },
        :data => {
          "ELA Scaled" => self.ela_scaled,
          "ELA Performance" => self.ela_performance,
          "ELA Growth" => self.ela_growth,
          "Math Scaled" => self.math_scaled,
          "Math Performance" =>  self.math_performance,
          "Math Growth" =>  self.math_growth,
          "SPED" => self.sped
        }
      }
    ]
  end

  def self.default_sort_by_math(room)

    math_risk = { "Low" => [], "Medium" => [], "High" => [] }

    if room.present?
        room.students.each do |s|
        if s.math_performance.present?

          risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
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

  def self.sort_by_risk(options = {})

    # TODO: Handle options hash that doesn't have all the variables we need
    lower_cutoff  = options["lower_cutoff"].to_i
    upper_cutoff  = options["upper_cutoff"].to_i
    room_id       = options["room_id"].to_i
    
    math_risk = { "Low" => [], "Medium" => [], "High" => [] }

    students = Room.find(room_id).students
    if students.present?
      students.each do |s|
        if s.math_performance.present?

          if lower_cutoff == 2 && upper_cutoff == 2  
            risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
          elsif lower_cutoff == 3 && upper_cutoff == 3
            risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
          else 
            risk_category = RISK_CATEGORY_DEFAULTS[s.math_performance]
          end

          if math_risk[risk_category].present? || math_risk[risk_category] == []
            math_risk[risk_category] = math_risk[risk_category] << s.to_tables
          end
        end
      end
    end
    math_risk

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

  def has_access_data?
    self.access_progress.present? && self.access_growth.present? && self.access_performanc.present?
  end

end
