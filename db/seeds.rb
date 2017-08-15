# This forces updating schema.rb before seeding.  This is necessary
# to allow `bundle exec rake db:migrate db:seed`, which otherwise would
# not update the schema until all rake tasks are completed, and the seed task
# would fail.
#
# See http://stackoverflow.com/questions/37850322/rails-dbseed-unknown-attribute
ActiveRecord::Base.descendants.each do |klass|
  klass.reset_column_information
end

require "#{Rails.root}/db/seeds/database_constants"


puts "Creating demo schools, homerooms, interventions..."
raise "empty yer db" if School.count > 0 ||
                        Student.count > 0 ||
                        InterventionType.count > 0 ||
                        Assessment.count > 0

# The local demo data setup uses the Somerville database constants
# (eg., the set of `ServiceType`s) for generating local demo data and
# for tests.
puts 'Seeding database constants for Somerville...'

DatabaseConstants.new.seed!
School.seed_somerville_schools

healey = School.find_by_name("Arthur D Healey")
wsns = School.find_by_name("West Somerville Neighborhood")

puts "Creating demo educators..."
Educator.destroy_all

Educator.create!([{
  email: "demo@example.com",
  full_name: 'Principal, Laura',
  password: "demo-password",
  local_id: '350',
  school: healey,
  admin: true,
  schoolwide_access: true,
  can_view_restricted_notes: true
}, {
  email: "demo-admin@example.com",
  password: "demo-password",
  districtwide_access: true,
  admin: true,
}, {
  email: "fake-fifth-grade@example.com",
  full_name: 'Teacher, Sarah',
  password: "demo-password",
  local_id: '450',
  school: healey,
  admin: false,
  schoolwide_access: false,
}, {
  email: "wsns@example.com",
  full_name: 'Teacher, Mari',
  password: 'demo-password',
  local_id: '550',
  school: wsns,
  admin: false,
  schoolwide_access: false,
}])

puts 'Creating homerooms..'

homerooms = [
  Homeroom.create(name: "HEA 300", grade: "3", school: healey),
  Homeroom.create(name: "HEA 400", grade: "4", school: healey),
  Homeroom.create(name: "HEA 500", grade: "5", school: healey),
  Homeroom.create(name: "WSNS 500", grade: "5", school: wsns),
]

ServiceUpload.create([
  { file_name: "ReadingIntervention-2016.csv" },
  { file_name: "ATP-2016.csv" },
  { file_name: "SPELL-2016.csv" },
  { file_name: "SomerSession-2016.csv" },
])

fifth_grade_educator = Educator.find_by_email('fake-fifth-grade@example.com')
wsns_fifth_grade_educator = Educator.find_by_email('wsns@example.com')

Homeroom.find_by_name("HEA 500").update_attribute(:educator, fifth_grade_educator)
Homeroom.find_by_name("WSNS 500").update_attribute(:educator, wsns_fifth_grade_educator)

homerooms.each do |homeroom|
  puts "Creating students for homeroom #{homeroom.name}..."
  school = homeroom.school
  15.times do
    FakeStudent.new(school, homeroom)
  end
end

15.times do
  FakeStudent.new(healey, nil)
end

Student.update_risk_levels
Student.update_recent_student_assessments

IepDocument.create!(
  file_name: 'fake-iep-document.pdf',
  file_date: DateTime.current,
  student: Student.first
)

PrecomputeStudentHashesJob.new(STDOUT).precompute_all!(Time.now)
