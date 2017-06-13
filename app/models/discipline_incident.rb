class DisciplineIncident < ActiveRecord::Base
  belongs_to :student
  belongs_to :student_school_year
  validates_presence_of :student,
                        :student_school_year,
                        :occurred_at
end
