require "#{Rails.root}/db/seeds/database_constants"

puts "Creating demo schools, homerooms, interventions..."
raise "empty yer db" if School.count > 0 ||
                        Student.count > 0 ||
                        InterventionType.count > 0 ||
                        Assessment.count > 0

healey = School.create(name: "Arthur D Healey")
wsns = School.create(name: "West Somerville Neighborhood")

# The local demo data setup uses the Somerville database constants
# (eg., the set of `ServiceType`s) for generating local demo data and
# for tests.
puts 'Seeding database constants for Somerville...'
DatabaseConstants.new.seed!

puts "Creating demo educators..."
Educator.destroy_all

Educator.create!([{
  email: "demo@example.com",
  full_name: 'Principal, Laura',
  password: "demo-password",
  local_id: '350',
  school: School.first,
  admin: true,
  schoolwide_access: true,
  can_view_restricted_notes: true
}, {
  email: "fake-fifth-grade@example.com",
  full_name: 'Teacher, Sarah',
  password: "demo-password",
  local_id: '450',
  school: School.first,
  admin: false,
  schoolwide_access: false,
}, {
  email: "wsns@example.com",
  full_name: 'Teacher, Mari',
  password: 'demo-password',
  local_id: '550',
  school: School.second,
  admin: false,
  schoolwide_access: false,
}])

puts 'Creating homerooms..'
homerooms = [
  Homeroom.create(name: "HEA 300", grade: "3", school: School.first),
  Homeroom.create(name: "HEA 400", grade: "4", school: School.first),
  Homeroom.create(name: "HEA 500", grade: "5", school: School.first),
  Homeroom.create(name: "HEA 501", grade: "5", school: School.first),
  Homeroom.create(name: "WSNS 500", grade: "5", school: School.second),
]

fifth_grade_educator = Educator.find_by_email('fake-fifth-grade@example.com')
wsns_fifth_grade_educator = Educator.find_by_email('wsns@example.com')

Homeroom.find_by_name("HEA 500").update_attribute(:educator, fifth_grade_educator)
Homeroom.find_by_name("WSNS 500").update_attribute(:educator, wsns_fifth_grade_educator)

homerooms.each do |homeroom|
  puts "Creating students for homeroom #{homeroom.name}..."
  15.times do
    FakeStudent.new(homeroom)
  end
end

Student.update_risk_levels
Student.update_student_school_years
Student.update_recent_student_assessments
