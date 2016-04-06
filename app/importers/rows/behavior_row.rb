class BehaviorRow < Struct.new(:row)
  # Expects the following headers:
  #
  #  :state_id, :local_id, :incident_code, :event_date, :incident_time,
  #  :incident_location, :incident_description, :school_local_id

  def self.build(row)
    new(row).build
  end

  def build
    discipline_incident = student_school_year.discipline_incidents.find_or_initialize_by(
      occurred_at: occurred_at,
      incident_code: row[:incident_code]
    )

    discipline_incident.assign_attributes(
      has_exact_time: has_exact_time?,
      incident_location: row[:incident_location],
      incident_description: row[:incident_description],
    )

    discipline_incident
  end

  private

  def has_exact_time?
    row[:incident_time].present?
  end

  def incident_time
    return 0 unless has_exact_time?
    incident_time = Time.parse(row[:incident_time])
    incident_time.hour.hours + incident_time.min.minutes
  end

  def occurred_at
    row[:event_date].to_datetime + incident_time
  end

  def student
    Student.find_by_local_id! row[:local_id]
  end

  def school_year
    DateToSchoolYear.new(occurred_at).convert
  end

  def student_school_year
    student.student_school_years.find_or_create_by(school_year: school_year)
  end
end
