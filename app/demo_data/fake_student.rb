class FakeStudent

  def initialize(homeroom)
    @student = Student.create(data)
    add_attendance_events
    add_discipline_incidents
    add_student_assessments
    homeroom.students << @student
  end

  def data
    base_data.merge(plan_504)
             .merge(program_assigned_and_sped_disability)
  end

  DISNEY_FIRST_NAMES = [
    "Aladdin", "Chip", "Daisy", "Mickey", "Minnie",
    "Donald", "Elsa", "Mowgli", "Olaf", "Pluto",
    "Pocahontas", "Rapunzel", "Snow", "Winnie"
  ]

  DISNEY_LAST_NAMES = [
    "Disney", "Duck", "Kenobi", "Mouse", "Pan", "Poppins", "Skywalker", "White"
  ]

  def base_data
    {
      school_id: School.first.id,
      grade: "5",
      hispanic_latino: [true, false].sample,
      race: ["A", "B", "H", "W"].sample,
      first_name: DISNEY_FIRST_NAMES.sample,
      last_name: DISNEY_LAST_NAMES.sample,
      local_id: "000#{rand(1000)}",
      limited_english_proficiency: ["Fluent", "FLEP-Transitioning", "FLEP"].sample,
      free_reduced_lunch: ["Free Lunch", "Not Eligible"].sample,
      home_language: ["Spanish", "English", "Portuguese", "Haitian-Creole"].sample
    }
  end

  def plan_504
    2.in(100) ? { plan_504: "504" } : { plan_504: "Not 504" }
  end

  def program_assigned_and_sped_disability
    if 20.in(100)
      { program_assigned: "Sp Ed" }.merge(sped).merge(disability)
    else
      if 15.in(100)
        { program_assigned: ["Reg Ed", "2Way English", "2Way Spanish"].sample }.merge(disability)
      else
        { program_assigned: ["Reg Ed", "2Way English", "2Way Spanish"].sample }
      end
    end
  end

  def sped
    {
      sped_level_of_need: ["High", "Moderate", "Low >= 2", "Low < 2"].sample,
      sped_placement: ["Full Inclusion", "Partial Inclusion", "Private Separate"].sample
    }
  end

  def disability
    {
      disability: ["Specific LDs", "Emotional", "Communication", "Autism"].sample
    }
  end

  def x2_assessment_generators
    [
      FakeMcasMathResultGenerator.new(@student),
      FakeMcasElaResultGenerator.new(@student),
      FakeDibelsResultGenerator.new(@student),
      FakeAccessResultGenerator.new(@student)
    ]
  end

  def star_assessment_generators
    [
      FakeStarMathResultGenerator.new(@student),
      FakeStarReadingResultGenerator.new(@student)
    ]
  end

  def add_student_assessments
    5.times do
      x2_assessment_generators.each do |assessment|
        StudentAssessment.new(assessment.next).save
      end
    end

    12.times do
     star_assessment_generators.each do |assessment|
        StudentAssessment.new(assessment.next).save
      end
    end
  end

  def add_attendance_events
    # Probabilities: https://github.com/codeforamerica/somerville-teacher-tool/issues/94

    attendance_event_generator = Rubystats::NormalDistribution.new(8.8, 10)

    94.in(100) do
      5.times do |n|
        attendance_event_generator.rng.round(0).times do
          attendance_event = [Absence.new, Tardy.new].sample
          attendance_event.student_school_year = @student.student_school_years.first
          attendance_event.occurred_at = Time.new - (rand * 100).to_i.days
          attendance_event.save
        end
      end
    end

  end

  def add_discipline_incidents
    # Probabilities: https://github.com/codeforamerica/somerville-teacher-tool/issues/94

    discipline_event_generator = Rubystats::NormalDistribution.new(5.2, 8.3)
    7.in(100) do
      5.times do |n|
        date_begin = Time.local(2010 + n, 8, 1)
        date_end = Time.local(2011 + n, 7, 31)
        discipline_event_generator.rng.round(0).times do
          discipline_incident = DisciplineIncident.new(FakeDisciplineIncident.data)
          discipline_incident.student_school_year = @student.student_school_years.first
          discipline_incident.occurred_at = Time.at(date_begin + rand * (date_end.to_f - date_begin.to_f))
          discipline_incident.save
        end
      end
    end

  end

end
