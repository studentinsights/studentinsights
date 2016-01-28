class DisciplineIncident < ActiveRecord::Base
  belongs_to :student_school_year, counter_cache: true
  validates_presence_of :student_school_year, :occurred_at
end
