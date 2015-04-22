class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_results, dependent: :destroy
  has_many :mcas_results, dependent: :destroy
  has_many :assessments, through: :mcas_results

  def self.default_sort(students)
    risk = { "Low" => [], "Medium" => [], "High" => [] }
    students.each do |s|
      result = s.mcas_results.last
      if result.present?
        if result.warning?
          risk["High"] << s
        elsif result.ela_performance == "NI" || result.math_performance == "NI"
          risk["Medium"] << s
        else
          risk["Low"] << s
        end
      end
    end
    return risk
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