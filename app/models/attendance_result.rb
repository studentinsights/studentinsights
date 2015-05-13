class AttendanceEvent < ActiveRecord::Base
  belongs_to :student
  belongs_to :school_year
end
