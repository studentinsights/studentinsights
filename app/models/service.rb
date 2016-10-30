class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type
  belongs_to :service_upload          # For bulk-uploaded services
  has_many :discontinued_services

  validates_presence_of :recorded_by_educator_id, :student_id, :service_type_id, :recorded_at, :date_started

  def discontinued?
    (discontinued_services.size > 0) && !has_scheduled_end_date?  # If the end date is in the future
                                                                  # the service isn't discontinued yet.
  end

  def has_scheduled_end_date?
    # Some services are scheduled to be discontinued in the future. When staff
    # enter new student services in the UI, they can't select a future end date yet.
    # But bulk-uploaded services can have a future end date. If a service has an
    # end date in the future, we don't want it to show up as "discontinued."

    end_date = discontinued_services.order(recorded_at: :desc)
                                    .first
                                    .recorded_at  # This attribute name isn't accurate
                                                  # anymore, we should change it to "date_ended"

    return end_date > DateTime.current
  end

  def active?
    !discontinued?
  end

  def self.active
    self.includes(:discontinued_services).where(:discontinued_services => { :id => nil })
  end

  def self.discontinued
    self.includes(:discontinued_services).where.not(:discontinued_services => { :id => nil })
  end

  def self.provider_names
    pluck(:provided_by_educator_name)
  end

end
