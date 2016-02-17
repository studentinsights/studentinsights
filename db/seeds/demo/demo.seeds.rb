puts "Creating demo schools, homerooms, interventions..."
raise "empty yer db" if School.count > 0 ||
                        Student.count > 0 ||
                        InterventionType.count > 0 ||
                        Assessment.count > 0

puts 'Seeding constants...'
Assessment.seed_somerville_assessments
InterventionType.seed_somerville_intervention_types
EventNoteType.seed_somerville_event_note_types

healey = School.create(name: "Arthur D Healey")

puts "Creating demo educators..."
Educator.destroy_all

Educator.create!([{
  email: "demo@example.com",
  full_name: 'Curtatone, Joe',
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

Homeroom.create(name: "101", grade: "4")
Homeroom.create(name: "102", grade: "5")

fifth_grade_educator = Educator.find_by_email('fake-fifth-grade@example.com')
Homeroom.last.update_attribute(:educator_id, fifth_grade_educator.id)

puts "Creating students for homeroom #1..."
15.times do
  FakeStudent.new(Homeroom.first)
end

puts "Creating students for homeroom #2..."
15.times do
  FakeStudent.new(Homeroom.last)
end

Student.update_risk_levels
Student.update_student_school_years
Student.update_recent_student_assessments
