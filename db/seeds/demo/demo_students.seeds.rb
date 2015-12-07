Dir["#{Rails.root}/db/seeds/demo/demo_data/*.rb"].each {|file| require file }

puts "Creating demo schools, homerooms, interventions..."

School.destroy_all
healey = School.create(name: "Arthur D Healey")

Homeroom.destroy_all
Homeroom.create(name: "101", grade: "4")
Homeroom.create(name: "102", grade: "5")

fifth_grade_educator = Educator.find_by_email('fake-fifth-grade@example.com')
Homeroom.last.update_attribute(:educator_id, fifth_grade_educator.id)

Student.destroy_all
StudentAssessment.destroy_all
DisciplineIncident.destroy_all
AttendanceEvent.destroy_all

InterventionType.destroy_all
InterventionType.seed_somerville_intervention_types

Assessment.create!(family: "MCAS", subject: "Math")
Assessment.create!(family: "MCAS", subject: "ELA")
Assessment.create!(family: "STAR", subject: "Math")
Assessment.create!(family: "STAR", subject: "Reading")
Assessment.create!(family: "ACCESS")
Assessment.create!(family: "DIBELS")

puts "Create students for homeroom #1..."
15.times { create_demo_student(Homeroom.first) }
puts "Create students for homeroom #2..."
15.times { create_demo_student(Homeroom.last) }

Student.update_risk_levels
Student.update_student_school_years
