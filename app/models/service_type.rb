class ServiceType < ActiveRecord::Base
  has_many :services

  def self.seed_somerville_service_types
    ServiceType.destroy_all
    ServiceType.create([
      { id: 502, name: 'Attendance Officer'},
      { id: 503, name: 'Attendance Contract'},
      { id: 504, name: 'Behavior Contract'},
      { id: 505, name: 'Counseling, in-house'},
      { id: 506, name: 'Counseling, outside'},
      { id: 507, name: 'Reading intervention'},
      { id: 508, name: 'Math intervention'},
      { id: 509, name: 'SomerSession' },
      { id: 510, name: 'Summer Program for English Language Learners' },
      { id: 511, name: 'Afterschool Tutoring' },
      { id: 512, name: 'Freedom School' },
    ])
  end

  def self.add_summer_program_status_to_service_types
    [509, 510, 512].each do |id|
      ServiceType.find(id).update!({ summer_program: true })
    end
  end

end
