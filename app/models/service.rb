class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type
  belongs_to :service_upload          # For bulk-uploaded services
  has_many :discontinued_services

  validates_presence_of :recorded_by_educator_id, :student_id, :service_type_id, :recorded_at, :date_started#, :estimated_end_date

  def discontinued?
    (discontinued_services.size > 0) && !has_scheduled_end_date?  # If the end date is in the future
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
    discontinued_services.order(discontinued_at: :desc).first.try(:discontinued_at)
  end

  def has_scheduled_end_date?
    return end_date > DateTime.current
  end

  def active?
    !discontinued?
  end

  def self.active
    future_discontinue + never_discontinued
  end

  def self.never_discontinued
    includes(:discontinued_services).where(:discontinued_services => { :id => nil })
  end

  def self.future_discontinue
    includes(:discontinued_services).where('discontinued_services.discontinued_at > ?', DateTime.current)
                                    .references(:discontinued_services)
  end

  def self.discontinued
    includes(:discontinued_services).where('discontinued_services.discontinued_at < ?', DateTime.current)
                                    .references(:discontinued_services)
  end

  def self.provider_names
    pluck(:provided_by_educator_name)
  end

end
