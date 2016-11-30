class DiscontinuedService < ActiveRecord::Base
  belongs_to :service
  belongs_to :recorded_by_educator, class_name: 'Educator'

  validates_presence_of :service_id, :recorded_by_educator_id, :recorded_at
  validate :must_be_recorded_after_service_start_date

  def must_be_recorded_after_service_start_date
    if service.date_started > recorded_at
      errors.add(:recorded_at, "must be after service start date")
    end
  end
end
