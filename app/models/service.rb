class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type
  has_many :discontinued_services

  validates_presence_of :recorded_by_educator_id, :student_id, :service_type_id, :recorded_at, :date_started
  validates :provided_by_educator_name, allow_nil: true,
            format: { with: /(\w+, \w+|^$)/, message: "Please use the form Last Name, First Name" }

  def discontinued?
    discontinued_services.size > 0
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
