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
Assessment.destroy_all
DisciplineIncident.destroy_all
AttendanceEvent.destroy_all

# Set up assessment subjects and families
AssessmentFamily.where(name: "MCAS").first_or_create!
AssessmentFamily.where(name: "STAR").first_or_create!
AssessmentSubject.where(name: "Math").first_or_create!
AssessmentSubject.where(name: "ELA").first_or_create!
AssessmentSubject.where(name: "Reading").first_or_create!

36.times do
  # Set up student demographics & SPED
  student = Student.create(FakeStudent.data)
  FakeStudent.randomize_504(student)
  FakeStudent.randomize_program_assigned(student)
  student.homeroom_id = Homeroom.all.sample.id
  student.save

  # Set up student assessments
  mcas_math_factory = FakeMcasMathResultGenerator.new
  star_math_factory = FakeStarMathResultGenerator.new
  mcas_ela_factory = FakeMcasElaResultGenerator.new
  star_reading_factory = FakeStarReadingResultGenerator.new

  5.times do
    result = Assessment.new(mcas_math_factory.next)
    result.update_attributes(student_id: student.id)
    result.save
  end
  12.times do
    result = Assessment.new(star_math_factory.next)
    result.update_attributes(student_id: student.id)
    result.save
  end
  5.times do
    result = Assessment.new(mcas_ela_factory.next)
    result.update_attributes(student_id: student.id)
    result.save
  end
  12.times do
    result = Assessment.new(star_reading_factory.next)
    result.update_attributes(student_id: student.id)
    result.save
  end

  # Aggregate data via https://github.com/codeforamerica/somerville-teacher-tool/issues/94
  discipline_event_generator = Rubystats::NormalDistribution.new(5.2, 8.3)
  attendance_event_generator = Rubystats::NormalDistribution.new(8.8, 10)
  7.in(100) do    # 7% of students have discipline events
    5.times do |n|
      date_begin = Time.local(2010 + n, 8, 1)
      date_end = Time.local(2011 + n, 7, 31)
      discipline_event_generator.rng.round(0).times do
        discipline_incident = DisciplineIncident.new(FakeDisciplineIncident.data)
        discipline_incident.student_id = student.id
        discipline_incident.event_date = Time.at(date_begin + rand * (date_end.to_f - date_begin.to_f))
        discipline_incident.save
      end
    end
  end
  94.in(100) do   # 94% of students have absence / attendance events
    5.times do |n|
      date_begin = Time.local(2010 + n, 8, 1)
      date_end = Time.local(2011 + n, 7, 31)
      attendance_event_generator.rng.round(0).times do
        attendance_event = AttendanceEvent.new(FakeAttendanceEvent.data)
        attendance_event.student_id = student.id
        attendance_event.event_date = Time.at(date_begin + rand * (date_end.to_f - date_begin.to_f))
        attendance_event.save
      end
    end
  end
end
