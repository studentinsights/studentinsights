class BehaviorRow < Struct.new(:row)
  def self.build(row)
    new(row).build
  end

  def build
    student_school_year.discipline_incidents.first_or_initialize(occurred_at: occurred_at, incident_code: row[:incident_code]) do |incident|
      incident.has_exact_time = has_exact_time?
      incident.incident_location = row[:incident_location]
      incident.incident_description = row[:incident_description]
    end
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
