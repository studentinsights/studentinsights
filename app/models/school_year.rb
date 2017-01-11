class SchoolYear < ActiveRecord::Base
  has_many :attendance_events
  has_many :discipline_incidents
  has_many :student_assessments
  has_many :interventions
  validates_uniqueness_of :name, :start

  def self.in_between(school_year_1, school_year_2)
    in_between_dates(school_year_1.start, school_year_2.start).order(:start).reverse
  end

  def self.in_between_dates(start_date, end_date)
    where(start: (start_date)..(end_date))
  end
end
