class SchoolYear < ActiveRecord::Base
  has_many :attendance_events
end
