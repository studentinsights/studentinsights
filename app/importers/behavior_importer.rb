class BehaviorImporter
  include X2Importer

  def export_file_name
    'behavior_export.txt'
  end

  def parse_row(row)
    student = Student.where(state_id: row[:state_id]).first_or_create!
    discipline_incident = DisciplineIncident.where(
      student_id: student.id,
      incident_code: row[:incident_code],
      event_date: row[:event_date] + " " + row[:incident_time],
      has_exact_time: row[:incident_time].present?
    ).first_or_create!
    discipline_incident.assign_attributes(
      incident_location: row[:incident_location],
      incident_description: row[:incident_description]
    )
    discipline_incident.save
  end
end
