class DisciplineIncident < ActiveRecord::Base
  belongs_to :student
  belongs_to :school_year
  before_save :assign_to_school_year
  validates_presence_of :event_date

  def assign_to_school_year
    self.school_year = DateToSchoolYear.new(event_date).convert
  end

end
