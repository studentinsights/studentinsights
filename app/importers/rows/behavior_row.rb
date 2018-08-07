class BehaviorRow < Struct.new(:row, :student_id)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  #
  # Expects the following headers:
  #
  #  :state_id, :local_id, :incident_code, :event_date, :incident_time,
  #  :incident_location, :incident_description, :school_local_id

  def build
    # This method is picky. A record must exactly match every field in a row
    # in order to `find`; otherwise a new record is `initialized`.

    # If any attributes about a discipline incident change upstream in Aspen/X2,
    # the existing record in the Insights database won't be marked by the
    # RecordSyncer and will be deleted at the end of the import task.
    DisciplineIncident.find_or_initialize_by(
      occurred_at: occurred_at,
      student_id: student_id,
      incident_code: row[:incident_code],
      has_exact_time: has_exact_time?,
      incident_location: row[:incident_location],
      incident_description: row[:incident_description],
    )
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

end
