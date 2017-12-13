class School < ActiveRecord::Base
  extend FriendlyId
  friendly_id :local_id, use: :slugged
  has_many :students
  has_many :educators
  has_many :homerooms

  def self.with_students
    School.all.select { |s| s.students.count > 0 }
  end

  def educators_without_test_account
    educators.where.not(local_id: 'LDAP')
  end

  def educator_names_for_services
    educators_without_test_account.pluck(:full_name)
  end

  def self.seed_somerville_schools
    School.create!([
      { state_id: 15, local_id: "BRN", name: "Benjamin G Brown", school_type: "ES" },
      { state_id: 75, local_id: "HEA", name: "Arthur D Healey", school_type: "ESMS" },
      { state_id: 83, local_id: "KDY", name: "John F Kennedy", school_type: "ESMS" },
      { state_id: 87, local_id: "AFAS", name: "Albert F. Argenziano School", school_type: "ESMS" },
      { state_id: 111, local_id: "ESCS", name: "E Somerville Community", school_type: "ESMS" },
      { state_id: 115, local_id: "WSNS", name: "West Somerville Neighborhood", school_type: "ESMS" },
      { state_id: 120, local_id: "WHCS", name: "Winter Hill Community", school_type: "ESMS" },
      { state_id: 410, local_id: "NW", name: "Next Wave Junior High", school_type: "MS" },
      { state_id: 505, local_id: "SHS", name: "Somerville High", school_type: "HS" },
      { state_id: 510, local_id: "FC", name: "Full Circle High School", school_type: "HS" },
      { local_id: "CAP", name: "Capuano Early Childhood Center" },
      { local_id: "PIC", name: "Parent Information Center" },
      { local_id: "SPED", name: "Special Education" },
    ])
  end

  def self.seed_new_bedford_schools
    School.create!([
      { name: "Charles S. Ashley", local_id: "010" },
      { name: "Elizabeth Carter Brooks", local_id: "015" },
      { name: "Elwyn G. Campbell", local_id: "020" },
      { name: "Sgt. William Carney Memorial Academy", local_id: "045" },
      { name: "James B. Congdon", local_id: "040" },
      { name: "John B. DeValles", local_id: "050" },
      { name: "Alfred J. Gomes", local_id: "063" },
      { name: "Irwin M. Jacobs", local_id: "070" },
      { name: "Ellen R. Hathaway", local_id: "075" },
      { name: "Hayden-McFadden", local_id: "078" },
      { name: "Abraham Lincoln", local_id: "095" },
      { name: "Carlos Pacheco ", local_id: "105" },
      { name: "John A. Parker ", local_id: "115" },
      { name: "Casimir Pulaski", local_id: "105" },
      { name: "Renaissance", local_id: "124" },
      { name: "Thomas R. Rodman", local_id: "125" },
      { name: "Jireh Swift", local_id: "130" },
      { name: "William H. Taylor", local_id: "135" },
      { name: "Betsey B. Winslow", local_id: "140" },
      { name: "Keith Middle", local_id: "405" },
      { name: "Normandin Middle", local_id: "410" },
      { name: "Roosevelt Middle", local_id: "415" },
      { name: "New Bedford High", local_id: "505" },
      { name: "Trinity Day Academy", local_id: "510" },
      { name: "Whaling City Jr./Sr. High", local_id: "515" },
    ])
  end

end
