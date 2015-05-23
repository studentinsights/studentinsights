class SchoolYear < ActiveRecord::Base
  has_many :attendance_events
  has_many :discipline_incidents
end
