class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :educator
  belongs_to :service_type

  validates_presence_of :educator_id, :student_id, :service_type_id, :recorded_at, :date_started

end
