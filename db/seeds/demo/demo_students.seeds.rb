Dir["#{Rails.root}/db/seeds/demo/demo_data/*.rb"].each {|file| require file }

puts "Creating demo students, school, homerooms, assessment results..."

School.destroy_all
healey = School.create(name: "Arthur D Healey")

Homeroom.destroy_all
n = 0
4.times do |n|
  Homeroom.create(name: "10#{n}")
  n += 1
end

Student.destroy_all
McasResult.destroy_all
StarResult.destroy_all
DisciplineIncident.destroy_all
AttendanceEvent.destroy_all

FIRST_NAMES = [ "Casey", "Josh", "Judith", "Tae", "Kenn" ]
LAST_NAMES = [ "Jones", "Pais", "Hoag", "Pak", "Scott" ]

36.times do
  student = Student.create(FakeStudent.data)
  student.homeroom_id = Homeroom.all.sample.id
  student.save
  result = McasResult.new(FakeMcasResult.data)
  result.update_attributes(student_id: student.id)
  result.save
  result = StarResult.new(FakeStarResult.data)
  result.update_attributes(student_id: student.id)
  result.save
  # rand(0..3).times do
  #   discipline_incident = DisciplineIncident.new(FakeDisciplineIncident.data)
  #   discipline_incident.student_id = student.id
  #   discipline_incident.save
  # end
  rand(0..20).times do
    attendance_event = AttendanceEvent.new(FakeAttendanceEvent.data)
    attendance_event.student_id = student.id
    attendance_event.save
  end
end
