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
                        EventNote.count > 0 ||
                        Service.count > 0

# The local demo data setup uses the Somerville database constants
# (eg., the set of `ServiceType`s) for generating local demo data and
# for tests.
puts 'Seeding database constants for Somerville...'

DatabaseConstants.new.seed!
School.seed_somerville_schools

healey = School.find_by_name("Arthur D Healey")
wsns = School.find_by_name("West Somerville Neighborhood")
shs = School.find_by_name("Somerville High")

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
}, {
  email: "shs_art@example.com",
  full_name: 'Teacher, Hugo',
  password: 'demo-password',
  local_id: '650',
  school: shs,
  admin: false,
  schoolwide_access: false,
}, {
  email: "shs_science@example.com",
  full_name: 'Teacher, Fatima',
  password: 'demo-password',
  local_id: '750',
  school: shs,
  admin: false,
  schoolwide_access: false,
}])

puts 'Creating homerooms..'

homerooms = [
  Homeroom.create(name: "HEA 500", grade: "5", school: healey),
  Homeroom.create(name: "WSNS 500", grade: "5", school: wsns),
]

puts 'Creating course and sections..'

art_course = Course.create(course_number: "ART-302", course_description: "Ceramic Art 3", school: shs)
science_course = Course.create(course_number: "SCI-201", course_description: "Physics 2", school: shs)

sections = [
  Section.create(section_number: "ART-302A", term_local_id: "FY", schedule: "2(M,R)", room_number: "201", course: art_course),
  Section.create(section_number: "ART-302B", term_local_id: "FY", schedule: "4(M,R)", room_number: "234", course: art_course),
  Section.create(section_number: "SCI-201A", term_local_id: "S1", schedule: "3(M,W,F)", room_number: "306W", course: science_course),
  Section.create(section_number: "SCI-201B", term_local_id: "S1", schedule: "4(M,W,F)", room_number: "306W", course: science_course),
]

ServiceUpload.create([
  { file_name: "ReadingIntervention-2016.csv" },
  { file_name: "ATP-2016.csv" },
  { file_name: "SPELL-2016.csv" },
  { file_name: "SomerSession-2016.csv" },
])

fifth_grade_educator = Educator.find_by_email('fake-fifth-grade@example.com')
wsns_fifth_grade_educator = Educator.find_by_email('wsns@example.com')
shs_art_educator = Educator.find_by_email('shs_art@example.com')
shs_science_educator = Educator.find_by_email('shs_science@example.com')

Homeroom.find_by_name("HEA 500").update_attribute(:educator, fifth_grade_educator)
Homeroom.find_by_name("WSNS 500").update_attribute(:educator, wsns_fifth_grade_educator)

art_course.sections.each do |section|
  EducatorSectionAssignment.create(educator: shs_art_educator, section: section)
end

science_course.sections.each do |section|
  EducatorSectionAssignment.create(educator: shs_science_educator, section: section)
end

homerooms.each do |homeroom|
  puts "Creating students for homeroom #{homeroom.name}..."
  school = homeroom.school
  10.times do
    FakeStudent.new(school, homeroom)
  end
end

shs_homeroom = Homeroom.create(name: "SHS ALL", grade: "10", school: shs)

sections.each do |section|
  puts "Creating students for section #{section.section_number}..."
  school = section.course.school
  10.times do
    grade_letter = ['A','B','C','D','F'].sample
    case grade_letter
      when "A"
        grade_numeric = rand(90..100)
      when "B"
        grade_numeric = rand(80..89)
      when "C"
        grade_numeric = rand(70..79)
      when "D"
        grade_numeric = rand(60..69)
      when "F"
        grade_numeric = rand(50..59)
    end

    fake_student = FakeStudent.new(school, shs_homeroom)
    StudentSectionAssignment.create(student: fake_student.student,
                                    section: section,
                                    grade_numeric: grade_numeric,
                                    grade_letter: grade_letter)
  end
end

10.times do
  FakeStudent.new(healey, nil)
end

Student.update_risk_levels!
Student.update_recent_student_assessments

PrecomputeStudentHashesJob.new(STDOUT).precompute_all!(Time.now)
