Assessment.destroy_all
School.destroy_all
assessment = Assessment.create(name: "MCAS", year: Time.new(2014))
healey = School.create(name: "Arthur D Healey")

Homeroom.destroy_all
n = 0
4.times do |n|
  Homeroom.create(name: "10#{n}")
  n += 1
end

Student.destroy_all
StudentResult.destroy_all

FIRST_NAMES = [ "Casey", "Josh", "Judith", "Tae", "Kenn" ]
LAST_NAMES = [ "Jones", "Pais", "Hoag", "Pak", "Scott" ]

36.times do
  student = Student.create(Student.fake_data)
  student.homeroom_id = Homeroom.all.sample.id
  student.save
  result = StudentResult.new(StudentResult.fake_data)
  result.update_attributes(student_id: student.id, assessment_id: assessment.id)
  result.save
end