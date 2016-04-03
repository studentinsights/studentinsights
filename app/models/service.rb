class Service < ActiveRecord::Base
  belongs_to :student
  belongs_to :provided_by_educator, class_name: 'Educator'
  belongs_to :recorded_by_educator, class_name: 'Educator'
  belongs_to :service_type
  has_many :discontinued_services

  validates_presence_of :recorded_by_educator_id, :provided_by_educator_id, :student_id, :service_type_id, :recorded_at, :date_started

  def discontinued?
    discontinued_services.size > 0
  end

  def self.active
    self.includes(:discontinued_services).where(:discontinued_services => { :id => nil })
  end

  def self.discontinued
    self.includes(:discontinued_services).where.not(:discontinued_services => { :id => nil })
  end
end
