def create_demo_student(homeroom)
  # Set up student demographics & SPED
  student = Student.create(FakeStudent.data)
  FakeStudent.randomize_504(student)
  FakeStudent.randomize_program_assigned(student)
  student.save
  homeroom.students << student

  # Set up student assessments
  mcas_math_factory = FakeMcasMathResultGenerator.new(student)
  star_math_factory = FakeStarMathResultGenerator.new(student)
  mcas_ela_factory = FakeMcasElaResultGenerator.new(student)
  star_reading_factory = FakeStarReadingResultGenerator.new(student)
  dibels_factory = FakeDibelsResultGenerator.new(student)
  access_factory = FakeAccessResultGenerator.new(student)
  intervention = FakeIntervention.new(student)
  Intervention.new(intervention.next).save

  yearly_assessments = [mcas_math_factory, mcas_ela_factory, dibels_factory, access_factory]
  star_assessments = [star_math_factory, star_reading_factory]

  5.times do
    yearly_assessments.each do |assessment|
      StudentAssessment.new(assessment.next).save
    end
  end
  12.times do
    star_assessments.each do |assessment|
      StudentAssessment.new(assessment.next).save
    end
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
      attendance_event_generator.rng.round(0).times do
        attendance_event = AttendanceEvent.new(FakeAttendanceEvent.data)
        attendance_event.student_id = student.id
        attendance_event.event_date = Time.new - (rand * 100).to_i.days
        attendance_event.save
      end
    end
  end
end
