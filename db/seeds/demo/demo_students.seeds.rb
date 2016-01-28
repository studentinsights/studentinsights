Dir["#{Rails.root}/db/seeds/demo/demo_data/*.rb"].each {|file| require file }

puts "Creating demo schools, homerooms, interventions..."

raise "empty yer db" if School.count > 0 ||
                        Student.count > 0 ||
                        InterventionType.count > 0 ||
                        Assessment.count > 0

healey = School.create(name: "Arthur D Healey")

Homeroom.create(name: "101", grade: "4")
Homeroom.create(name: "102", grade: "5")

fifth_grade_educator = Educator.find_by_email('fake-fifth-grade@example.com')
Homeroom.last.update_attribute(:educator_id, fifth_grade_educator.id)

InterventionType.seed_somerville_intervention_types

puts "Creating assessments..."
Assessment.seed_somerville_assessments

puts "Creating students for homeroom #1..."
15.times { create_demo_student(Homeroom.first) }
puts "Creating students for homeroom #2..."
15.times { create_demo_student(Homeroom.last) }

Student.update_risk_levels
Student.update_student_school_years
Student.update_recent_student_assessments
