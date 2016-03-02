class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :provided_by_educator, class_name: 'Educator'
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type

  validates_presence_of :recorded_by_educator_id, :provided_by_educator_id, :student_id, :service_type_id, :recorded_at, :date_started

end
