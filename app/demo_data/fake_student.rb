class FakeStudent
  ATTENDANCE_EVENT_REASONS = %w[
    Appointment
    Bereavement
    Holiday
    Late
    Legal
    Medical
    No Reason
    Nurse
    Parent
    School
    Sick
    Suspended
    Transportation
    Truant
    Vacation
    Walked Out
    Weather
    Withdrawal
  ]

  ATTENDANCE_EVENT_COMMENTS = [
    'Received doctor note.',
    'Mom called, did not leave a reason.'
  ]

  def self.create!(school, homeroom)
    FakeStudent.new(school, homeroom).create!
  end

  def initialize(school, homeroom)
    @school = school
    @homeroom = homeroom
  end

  def create!
    @student = Student.create!(data)

    add_student_to_homeroom
    add_ieps

    new_student = rand > 0.95
    if !new_student
      add_attendance_events
      add_discipline_incidents
      add_deprecated_interventions
      add_event_notes
      add_services
      add_mcas_assessments
      add_dibels_assessments
      add_access_assessments
      add_star_assessments
    end

    @student
  end

  private

  def add_student_to_homeroom
    if @homeroom
      @homeroom.students << @student
    end
  end

  def grade
    return @homeroom.grade if @homeroom
    return 3
  end

  def house
    return HOUSE_NAMES.sample if @school.school_type == "HS"
  end

  def counselor
    return COUNSELOR_VALUES.sample if @school.school_type == "HS"
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

  HOUSE_NAMES = [
    "Beacon", "Elm", "Highland", "Broadway"
  ]

  COUNSELOR_VALUES = [
    "SOFIA", "WOODY", "BUZZ"
  ]

  SPED_LIAISON_VALUES = [
    "MILNER", "MORENO", "CONCEPCION"
  ]

  def base_data
    {
      school: @school,
      date_of_birth: fake_date_of_birth,
      enrollment_status: enrollment_status,
      grade: grade,
      first_name: DISNEY_FIRST_NAMES.sample,
      last_name: DISNEY_LAST_NAMES.sample,
      local_id: unique_local_id,
      limited_english_proficiency: ["Fluent", "FLEP-Transitioning", "Limited", "FLEP"].sample,
      free_reduced_lunch: ["Free Lunch", "Not Eligible", "Reduced Lunch", nil].sample,
      home_language: ["Spanish", "English", "Portuguese", "Haitian-Creole"].sample,
      race: ['Black', 'White', 'Asian'].sample,
      hispanic_latino: [true, false].sample,
      gender: ['M', 'F'].sample,
      primary_phone: '999-999-9999 C-Mom',
      primary_email: 'student@example.com',
      house: house,
      counselor: counselor
    }
  end

  def start_of_this_school_year
    DateTime.new(DateTime.now.year, 9, 1)
  end

  def kindergarten_year
    start_of_this_school_year - grade.to_i.years
  end

  def fake_date_of_birth
    kindergarten_year - 5.years + rand(0..365).days
  end

  def random_local_id
    "000#{rand(1000)}"
  end

  def unique_local_id
    existing_local_ids = Student.pluck(:local_id)
    local_id = random_local_id
    while existing_local_ids.include?(local_id)
      local_id = random_local_id
    end
    local_id
  end

  def enrollment_status
    7.in(8) ? 'Active' : 'Transferred'
  end

  def plan_504
    2.in(100) ? { plan_504: "504" } : { plan_504: "Not 504" }
  end

  def program_assigned_and_sped_disability
    if 20.in(100)
      { program_assigned: "Sp Ed" }.merge(sped).merge(disability).merge(sped_liaison)
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

  def sped_liaison
    if PerDistrict.new.import_student_sped_liaison?
      { sped_liaison: SPED_LIAISON_VALUES.sample }
    end
  end

  def add_mcas_assessments
    generators = [
      FakeMcasMathResultGenerator.new(@student),
      FakeMcasElaResultGenerator.new(@student),
      FakeNextGenMcasMathResultGenerator.new(@student),
      FakeNextGenMcasElaResultGenerator.new(@student)
    ]

    generators.each do |generator|
      4.times { StudentAssessment.new(generator.next).save! }
    end
  end

  def add_dibels_assessments
    generator = FakeDibelsResultGenerator.new(@student)
    4.times { StudentAssessment.new(generator.next).save! }
  end

  def add_star_assessments
    star_period_days = 90
    # Define semi-realistic date ranges for STAR assessments
    start_date = DateTime.new(2014, 9, 1)
    now = DateTime.now
    assessment_count = (now - start_date).to_i / star_period_days
    options = {
      start_date: start_date,
      star_period_days: star_period_days
    }

    generators = [
      FakeStarMathResultGenerator.new(@student, options),
      FakeStarReadingResultGenerator.new(@student, options)
    ]
    generators.each do |star_assessment_generator|
      assessment_count.times do
        StudentAssessment.new(star_assessment_generator.next).save!
      end
    end
  end

  def add_access_assessments
    return if @student.limited_english_proficiency == 'Fluent'
    generator = FakeAccessResultGenerator.new(@student)
    3.times { StudentAssessment.new(generator.next).save! }
  end

  def add_attendance_events
    d = {
      0 => 0.04,
      (1..6) => 0.41,
      (15..28) => 0.52,
      (29..100) => 0.03,
    }

    events_for_year = DemoDataUtil.sample_from_distribution(d)

    occurred_ats = DemoDataUtil.generate_unique(events_for_year) do
      DemoDataUtil.random_time.to_date
    end
    events_for_year.times do |index|
      occurred_at = occurred_ats[index]

      attendance_event = [Absence.new, Tardy.new].sample
      attendance_event.occurred_at = occurred_at
      attendance_event.student = @student

      # Frequencies for attendance event reasons/comments/dismissed/excused
      # modeled on Somerville data, for queries see:
      # https://github.com/studentinsights/studentinsights/pull/1653#issue-184358100
      if attendance_event.class == Absence
        attendance_event.dismissed = (rand < 0.006)
        attendance_event.excused = (rand < 0.0627)
        attendance_event.reason = ATTENDANCE_EVENT_REASONS.sample if rand < 0.29
        attendance_event.comment = ATTENDANCE_EVENT_COMMENTS.sample if rand < 0.18

      elsif attendance_event.class == Tardy
        attendance_event.dismissed = (rand < 0.019)
        attendance_event.excused = (rand < 0.027)
        attendance_event.reason = ATTENDANCE_EVENT_REASONS.sample if rand < 0.1
        attendance_event.comment = ATTENDANCE_EVENT_COMMENTS.sample if rand < 0.04
      end

      attendance_event.save!
    end
  end

  def add_discipline_incidents
    d = {
      0 => 0.23,
      1 => 0.30,
      2 => 0.23,
      (3..5) => 0.13,
      (6..15) => 0.11,
    }

    events_for_year = DemoDataUtil.sample_from_distribution(d)
    events_for_year.times do
      discipline_incident = FactoryBot.create(:discipline_incident, student: @student)
      discipline_incident.save!
    end
  end

  def add_deprecated_interventions
    15.in(100) do
      generator = FakeInterventionGenerator.new(@student)
      intervention_count = rand > 0.5 ? 0 : (1..6).to_a.sample
      intervention_count.times do
        intervention = Intervention.new(generator.next)
        intervention.save!
      end
    end
    nil
  end

  #These are saving for some students only.
  def add_event_notes
    generator = FakeEventNoteGenerator.new(@student)
    rand(0..9).times { EventNote.new(generator.next).save! }
    nil
  end

  #These are saving for some students only.
  def add_services
    generator = FakeServiceGenerator.new(@student)
    service_counts = 20.in(100) ? rand(1..5) : 0
    service_counts.times { Service.new(generator.next).save! }
    nil
  end

  def add_ieps
    15.in(100) do
      IepDocument.create(
        file_name: 'Fake IEP',
        student: @student
      )
    end
    nil
  end

end
