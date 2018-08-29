class DashboardQueries
  def initialize(educator, options = {})
    @educator = educator
    @authorizer = Authorizer.new(educator)
    @cutoff_time = SchoolYear.first_day_of_school_for_time(options.fetch(:time_now, Time.now))
  end

  def absence_dashboard_data(school)
    # authorization
    students = authorized_students_for_dashboard(school) do |students_relation|
      students_relation.includes([homeroom: :educator])
    end

    # query for absences
    absences = Absence
      .where(student_id: students.map(&:id))
      .where('occurred_at >= ?', @cutoff_time)

    # serialize and merge
    all_absences_json = absences.as_json(only: [
      :student_id,
      :occurred_at,
      :excused,
      :dismissed
    ])
    students_json = students.as_json({
      only: [
        :first_name,
        :last_name,
        :grade,
        :id
      ],
      methods: [
        :latest_note
      ]
    })
    students_with_events = students_json.map do |student_json|
      student_id = student_json['id']
      student = students.find {|s| s.id == student_id }
      absences_json = all_absences_json.select {|a| a['student_id'] == student_id}
      student_json.merge({
        absences: absences_json,
        homeroom_label: homeroom_label(student.homeroom)
      })
    end
    return_json(students_with_events, school)
  end

  def tardies_dashboard_data(school)
    students = authorized_students_for_dashboard(school) do |students_relation|
      students_relation.includes([homeroom: :educator])
    end
    students_with_events = students.map do |student|
      individual_student_tardies_data(student)
    end
    return_json(students_with_events, school)
  end

  def discipline_dashboard_data(school)
    student_discipline_data = authorized_students_for_dashboard(school) do |students_relation|
      students_relation
        .includes([homeroom: :educator], :discipline_incidents, :event_notes)
        .where('occurred_at >= ?', @cutoff_time)
        .references(:discipline_incidents)
    end
    students_with_events = student_discipline_data.map do |student|
      individual_student_discipline_data(student)
    end
    return_json(students_with_events, school)
  end

  private
  def return_json(students_with_events, school)
    {
      students_with_events: students_with_events,
      school: school.as_json(only: [:id, :local_id, :name])
    }
  end

  def shared_student_fields(student)
    student.as_json(only: [
      :first_name,
      :last_name,
      :grade,
      :id
    ]).merge({
      homeroom_label: homeroom_label(student.homeroom),
      latest_note: student.latest_note
    })
  end

  def individual_student_tardies_data(student)
    shared_student_fields(student).merge({
      tardies: student.tardies
        .where('occurred_at >= ?', @cutoff_time)
        .as_json(only: [:student_id, :occurred_at])
    })
  end

  def individual_student_discipline_data(student)
    shared_student_fields(student).merge({
      discipline_incidents: student.discipline_incidents.as_json(only: [
        :student_id,
        :incident_code,
        :incident_location,
        :has_exact_time,
        :occurred_at
      ])
    })
  end

  # Filter to match the students in their feed as well (eg, HS counselors
  # see just their caseload).
  def authorized_students_for_dashboard(school, &block)
    @authorizer.authorized do
      students_with_includes = block.call(school.students.active)
      FeedFilter.new(@educator).filter_for_educator(students_with_includes).to_a # workaround for AuthorizeDispatcher#filter_relation
    end
  end

  def homeroom_label(homeroom)
    homeroom.try(:educator).try(:full_name) || homeroom.try(:name) || "No Homeroom"
  end
end
