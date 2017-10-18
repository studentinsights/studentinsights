class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type
  belongs_to :service_upload          # For bulk-uploaded services
  has_many :discontinued_services

  validates_presence_of :recorded_by_educator_id, :student_id, :service_type_id, :recorded_at, :date_started
  validate :must_be_discontinued_after_service_start_date

  def discontinued?
    discontinued_at != nil && !has_scheduled_end_date? # If the end date is in the future
                                                           # the service isn't discontinued yet.
  end

  def end_date
    # Some services are scheduled to be discontinued in the future. When staff
    # enter new student services in the UI, they can't select a future end date yet.
    # But bulk-uploaded services can have a future end date. If a service has an
    # end date in the future, we don't want it to show up as "discontinued."
    #
    # This attribute name isn't accurate
    # anymore, we should change it to "date_ended"
    try(:discontinued_at)
  end

  def has_scheduled_end_date?
    return end_date > DateTime.current
  end

  def must_be_discontinued_after_service_start_date
    unless discontinued_at.nil?
      if date_started > discontinued_at
        errors.add(:discontinued_at, "must be after service start date")
      end
    end
  end

  def active?
    !discontinued?
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
