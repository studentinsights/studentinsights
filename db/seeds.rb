require "#{Rails.root}/db/seeds/database_constants"
require "#{Rails.root}/spec/support/test_pals"


def sample_numeric_grade_from_letter(grade_letter)
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
end


puts 'Starting seeds.rb...'

# This forces updating schema.rb before seeding.  This is necessary
# to allow `bundle exec rake db:migrate db:seed`, which otherwise would
# not update the schema until all rake tasks are completed, and the seed task
# would fail.
#
# See http://stackoverflow.com/questions/37850322/rails-dbseed-unknown-attribute
ActiveRecord::Base.descendants.each do |klass|
  klass.reset_column_information
end

puts "Checking for existing data in the database..."
[School, Student, EventNote, Service].each do |klass|
  raise "empty yer db for: #{klass}" if klass.count > 0
end

# The local demo data setup uses the Somerville database constants
# (eg., the set of `ServiceType`s) for generating local demo data and
# for tests.
puts 'Seeding database constants for Somerville...'
DatabaseConstants.new.seed!

puts 'Destroying all educators...'
Educator.destroy_all

puts 'Creating TestPals...'
pals = TestPals.create!

puts 'Uploading services...'
ServiceUpload.create!([
  { file_name: "ReadingIntervention-2016.csv" },
  { file_name: "ATP-2016.csv" },
  { file_name: "SPELL-2016.csv" },
  { file_name: "SomerSession-2016.csv" },
])

puts 'Creating more students for each homeroom...'
Homeroom.all.each do |homeroom|
  puts "  Creating for homeroom: #{homeroom.name}..."
  9.times { FakeStudent.new(homeroom.school, homeroom) }
end

puts 'Creating additional students for the Healey with no homeroom...'
9.times { FakeStudent.new(pals.healey, nil) }

puts 'Creating more sophomore students...'
Section.all.each do |section|
  puts "  Creating students for section #{section.section_number}..."
  school = section.course.school
  9.times do
    grade_letter = ['A','B','C','D','F'].sample
    grade_numeric = sample_numeric_grade_from_letter(grade_letter)
    fake_student = FakeStudent.new(school, pals.shs_sophomore_homeroom)
    StudentSectionAssignment.create!({
      student: fake_student.student,
      section: section,
      grade_numeric: grade_numeric,
      grade_letter: grade_letter
    })
  end
end


puts 'Updating indexes...'
Student.update_risk_levels!
Student.update_recent_student_assessments
PrecomputeStudentHashesJob.new(STDOUT).precompute_all!(Time.now)

puts 'Done seeds.rb.'
