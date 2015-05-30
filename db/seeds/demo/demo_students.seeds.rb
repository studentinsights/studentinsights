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
  discipline_event_generator = Rubystats::NormalDistribution.new(5.2, 8.3)
  attendance_event_generator = Rubystats::NormalDistribution.new(8.8, 10)
  # guestimating that 40% of students have discipline events
  2.in(5) do
    5.times do |n|
      date_begin = Time.local(2010 + n, 1, 1)
      date_end = Time.local(2010 + n, 12, 31)
      discipline_event_generator.rng.round(0).times do
        discipline_incident = DisciplineIncident.new(FakeDisciplineIncident.data)
        discipline_incident.student_id = student.id
        discipline_incident.event_date = Time.at(date_begin + rand * (date_end.to_f - date_begin.to_f))
        discipline_incident.save
      end
    end
  end
  94.in(100) do
    5.times do |n|
      date_begin = Time.local(2010 + n, 1, 1)
      date_end = Time.local(2010 + n, 12, 31)
      attendance_event_generator.rng.round(0).times do
        attendance_event = AttendanceEvent.new(FakeAttendanceEvent.data)
        attendance_event.student_id = student.id
        attendance_event.event_date = Time.at(date_begin + rand * (date_end.to_f - date_begin.to_f))
        attendance_event.save
      end
    end
  end
end
