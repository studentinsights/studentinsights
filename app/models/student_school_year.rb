class StudentSchoolYear < ActiveRecord::Base
  belongs_to :student
  belongs_to :school_year
  has_many :attendance_events
end
