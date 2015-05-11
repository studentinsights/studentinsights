class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_results, dependent: :destroy
  has_many :mcas_results, dependent: :destroy
  has_many :star_results, dependent: :destroy
  validates_uniqueness_of :state_id

  def latest_star
    if star_results.present?
      star_results.last
    end
  end

  def latest_mcas
    if mcas_results.present?
      mcas_results.last
    end
  end
end