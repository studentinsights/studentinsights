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
      incident_date: row[:incident_date],
      incident_time: row[:incident_time],
    ).first_or_create!
    discipline_incident.assign_attributes(row.except(:state_id))
    discipline_incident.save
	end
end
