class SchoolYear < ActiveRecord::Base
  has_many :attendance_events
  has_many :discipline_incidents
  validates_uniqueness_of :name, :start

  def self.in_between(school_year_1, school_year_2)
    where(start: (school_year_1.start)..(school_year_2.start)).order(:start)
  end
end
