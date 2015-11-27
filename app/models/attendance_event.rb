class AttendanceEvent < ActiveRecord::Base
  include DateToSchoolYear
  belongs_to :student
  belongs_to :school_year
  before_save :assign_to_school_year
  validates_presence_of :event_date

  def assign_to_school_year
    self.school_year = date_to_school_year(event_date)
  end

end
