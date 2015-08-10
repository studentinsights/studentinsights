class School < ActiveRecord::Base
  has_many :students

  def self.seed_somerville_schools
    School.create([
      { state_id: 15, local_id: "BRN", name: "Benjamin G Brown", school_type: "ES" },
      { state_id: 75, local_id: "HEA", name: "Arthur D Healey", school_type: "ESMS" },
      { state_id: 83, local_id: "KDY", name: "John F Kennedy", school_type: "ESMS" },
      { state_id: 87, local_id: "AFAS", name: "Albert F. Argenziano School", school_type: "ESMS" },
      { state_id: 111, local_id: "ESCS", name: "E Somerville Community", school_type: "ESMS" },
      { state_id: 115, local_id: "WSNS", name: "West Somerville Neighborhood", school_type: "ESMS" },
      { state_id: 120, local_id: "WHCS", name: "Winter Hill Community", school_type: "ESMS" },
      { state_id: 410, local_id: "NW", name: "Next Wave Junior High", school_type: "MS" },
      { state_id: 505, local_id: "SHS", name: "Somerville High", school_type: "HS" },
      { state_id: 510, local_id: "FC", name: "Full Circle High School", school_type: "HS" }
    ])
  end

end
