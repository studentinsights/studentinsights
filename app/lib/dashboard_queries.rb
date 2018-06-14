class DashboardQueries
  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(educator)
  end

  def absence_dashboard_data(school)
    student_absence_data = authorized_students_for_dashboard(school) do |students_relation|
      students_relation.includes([homeroom: :educator], :dashboard_absences,:sst_notes)
    end
    student_absence_data.map do |student|
      individual_student_absence_data(student)
    end
  end

  def tardies_dashboard_data(school)
    student_tardies_data = authorized_students_for_dashboard(school) do |students_relation|
      students_relation.includes([homeroom: :educator], :dashboard_tardies,:sst_notes)
    end
    student_tardies_data.map do |student|
      individual_student_tardies_data(student)
    end
  end

  def discipline_dashboard_data(school)
    student_discipline_data = authorized_students_for_dashboard(school) do |students_relation|
      students_relation
        .includes([homeroom: :educator], :discipline_incidents,:sst_notes)
        .where('occurred_at >= ?', 1.year.ago).references(:discipline_incidents)
    end
    student_discipline_data.map do |student|
      individual_student_discipline_data(student)
    end
  end

  private
  def shared_student_fields(student)
    student.as_json(only: [
      :first_name,
      :last_name,
      :grade,
      :id
    ]).merge({
      homeroom_label: homeroom_label(student.homeroom),
      sst_notes: student.sst_notes.as_json(only: [:event_note_type_id, :recorded_at])
    })
  end

  def individual_student_absence_data(student)
    shared_student_fields(student).merge({
      absences: student.dashboard_absences.as_json(only: [:student_id, :occurred_at])
    })
  end

  def individual_student_tardies_data(student)
    shared_student_fields(student).merge({
      tardies: student.dashboard_tardies.as_json(only: [:student_id, :occurred_at])
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
      FeedFilter.new(@educator).filter_for_educator(students_with_includes)
    end
  end

  def homeroom_label(homeroom)
    homeroom.try(:educator).try(:full_name) || homeroom.try(:name) || "No Homeroom"
  end
end
