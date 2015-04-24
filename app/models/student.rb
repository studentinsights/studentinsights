class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_results, dependent: :destroy
  has_many :mcas_results, dependent: :destroy
  has_many :star_results, dependent: :destroy
  has_many :assessments, through: :mcas_results

  def high_risk?
    if mcas_results.present?
     mcas_results.last.warning?
    end
  end

  def medium_risk?
    if mcas_results.present?
      last_result = mcas_results.last
      last_result.ela_performance == "NI" || last_result.math_performance == "NI"
    end
  end

  def low_risk?
    !medium_risk? && !high_risk?
  end

  # Fake data for demo roster

  FIRST_NAMES = [ "Casey", "Josh", "Judith", "Tae", "Kenn" ]
  LAST_NAMES = [ "Jones", "Pais", "Hoag", "Pak", "Scott" ]

  def self.fake_data
    {
      grade: "5",
      hispanic_latino: [true, false].sample,
      race: ["A", "B", "H", "W"].sample, 
      low_income: [true, false].sample,
      first_name: FIRST_NAMES.sample,
      last_name: LAST_NAMES.sample,
      state_identifier: "000#{rand(1000)}", 
      limited_english_proficient: [true, false].sample, 
      former_limited_english_proficient: [true, false].sample,
      sped: [true, false, false, false].sample
    }
  end

end