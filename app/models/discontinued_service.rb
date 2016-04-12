class DiscontinuedService < ActiveRecord::Base
  belongs_to :service
  belongs_to :recorded_by_educator, class_name: 'Educator'

  validates_presence_of :service_id, :recorded_by_educator_id, :recorded_at
end
