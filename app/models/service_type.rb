class ServiceType < ApplicationRecord
  has_many :services

  COMMUNITY_SCHOOLS = 513
  
  def self.seed_for_all_districts
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
      { id: 513, name: 'Community Schools' },
      { id: 514, name: 'X-Block' },
    ])
  end

  # This is a separate method because of migrations
  def self.add_summer_program_status_to_service_types
    [509, 510, 512].each do |id|
      ServiceType.find(id).update!({ summer_program: true })
    end
  end

  # This is a separate method because of migrations
  def self.add_somerville_summer_2018_service_types
    ServiceType.create!([
      { id: 515, name: 'Calculus Project' }, # Intensive 4 week summer program for middle schoolers who exhibit average or just below average math performance.  Goal is to preview upcoming content, build problem-solving skills, and encourage students to study and pursue STEM fields.
      { id: 516, name: 'Boston Breakthrough' }, # Intensive 6 week summer program for incoming 7th graders and their families focused on college preparation.  Students are coached throughout this year, next summer, and beyond.
      { id: 517, name: 'Summer Explore' }, # An intensive 5 week summer program for preschoolers at risk for academic failure.  The focus is on building skills needed for the transition to Kindergarten.
      { id: 518, name: 'Focused Math Intervention' } # An 8 week cycle, 4 days a week focused on filling in math gaps in a small group setting using a research-based mathematics intervention called Focused Math Intervention.  Sessions take place during X-Block and intervention focuses on previous year’s standards that have not yet been met.
    ])
  end
end
