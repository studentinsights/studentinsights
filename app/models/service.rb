class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type
  belongs_to :service_upload, optional: true # For bulk-uploaded services only

  validates_presence_of :recorded_by_educator_id, :student, :service_type_id,
    :recorded_at, :date_started
  validate :must_be_discontinued_after_service_start_date
  validate :no_overlap

  def discontinued?
    discontinued_at.present? && (DateTime.current > discontinued_at)
  end

  def active?
    !discontinued?
  end

  def no_overlap
    return if student.nil?

    same_service_type = student.services.where(service_type_id: service_type_id)

    if same_service_type.detect { |service| service.active? }
      errors.add(:student_id, "already has an active service")
    end
  end

  def must_be_discontinued_after_service_start_date
    unless discontinued_at.nil?
      if date_started > discontinued_at
        errors.add(:discontinued_at, "must be after service start date")
      end
    end
  end

  def self.active
    future_discontinue + never_discontinued
  end

  def self.never_discontinued
    where(discontinued_at: nil)
  end

  def self.future_discontinue
    where('discontinued_at > ?', DateTime.current)
  end

  def self.discontinued
    where('discontinued_at < ?', DateTime.current)
  end

  def self.provider_names
    pluck(:provided_by_educator_name)
  end

end
