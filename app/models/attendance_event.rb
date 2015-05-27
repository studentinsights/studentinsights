class AttendanceEvent < ActiveRecord::Base
  include DateToSchoolYear
  belongs_to :student
  belongs_to :school_year
  before_save :assign_to_school_year

  def assign_to_school_year
    school_year = date_to_school_year(event_date)
    self.school_year_id = school_year.id
  end
end
