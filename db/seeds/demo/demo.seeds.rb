require "#{Rails.root}/db/seeds/database_constants"

puts "Creating demo schools, homerooms, interventions..."
raise "empty yer db" if School.count > 0 ||
                        Student.count > 0 ||
                        InterventionType.count > 0 ||
                        Assessment.count > 0

healey = School.create(name: "Arthur D Healey")

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
  schoolwide_access: true,
  school: School.first,
  admin: true
}, {
  email: "fake-fifth-grade@example.com",
  full_name: 'Teacher, Sarah',
  password: "demo-password",
  local_id: '450',
  school: School.first,
  admin: false
}])

puts 'Creating homerooms..'
homerooms = [
  Homeroom.create(name: "103", grade: "3"),
  Homeroom.create(name: "104", grade: "4"),
  Homeroom.create(name: "105", grade: "5")
]

fifth_grade_educator = Educator.find_by_email('fake-fifth-grade@example.com')
Homeroom.last.update_attribute(:educator_id, fifth_grade_educator.id)

homerooms.each do |homeroom|
  puts "Creating students for homeroom #{homeroom.name}..."
  15.times do
    FakeStudent.new(homeroom)
  end
end

Student.update_risk_levels
Student.update_student_school_years
Student.update_recent_student_assessments
