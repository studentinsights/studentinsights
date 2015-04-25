class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_results, dependent: :destroy
  has_many :mcas_results, dependent: :destroy
  has_many :star_results, dependent: :destroy
  
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

end