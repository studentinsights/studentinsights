class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_events, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :discipline_incidents, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :mcas_results, dependent: :destroy
  has_many :star_results, dependent: :destroy
  validates_presence_of :state_id
  validates_uniqueness_of :state_id
  include DateToSchoolYear

  def school_years
    if registration_date.present?
      current_school_year = date_to_school_year(Time.new)
      first_school_year = date_to_school_year(registration_date)
      SchoolYear.in_between(first_school_year, current_school_year)
    end
  end

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
