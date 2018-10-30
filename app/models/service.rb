class Service < ApplicationRecord
  belongs_to :student
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type
  belongs_to :service_upload, optional: true # For bulk-uploaded services only

  validates_presence_of :recorded_by_educator_id, :student_id, :service_type_id, :recorded_at, :date_started
  validate :must_be_discontinued_after_service_start_date

  def self.has_active_service?(student_id, service_type_id)
    Service.where(student_id: student_id, service_type_id: service_type_id).active.count > 0
  end

  def self.active
    where('discontinued_at IS NULL OR discontinued_at > ?', Time.now)
  end

  def self.never_discontinued
    where(discontinued_at: nil)
  end

  def self.future_discontinue
    where('discontinued_at > ?', Time.now)
  end

  def self.discontinued
    where('discontinued_at < ?', Time.now)
  end

  def self.provider_names
    pluck(:provided_by_educator_name)
  end

  def discontinued?
    discontinued_at.present? && (Time.now > discontinued_at)
  end

  def active?
    !discontinued?
  end

  private
  def must_be_discontinued_after_service_start_date
    unless discontinued_at.nil?
      if date_started > discontinued_at
        errors.add(:discontinued_at, "must be after service start date")
      end
    end
  end
end
