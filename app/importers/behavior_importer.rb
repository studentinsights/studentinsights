class BehaviorImporter
  include Connector
  include Importer

  def remote_file_name
    'behavior_export.txt'
  end

  def import_row(row)
    student = Student.where(local_id: row[:local_id]).first_or_create!
    event_date = row[:event_date]
    incident_time = row[:incident_time]

    if event_date.present?
      event_date += (" " + incident_time) if incident_time.present?
      discipline_incident = DisciplineIncident.where(
        student_id: student.id,
        incident_code: row[:incident_code],
        event_date: event_date.to_datetime,
        has_exact_time: incident_time.present?
      ).first_or_create!
      discipline_incident.assign_attributes(
        incident_location: row[:incident_location],
        incident_description: row[:incident_description]
      )
      discipline_incident.save
    end
  end
end
