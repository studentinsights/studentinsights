class AttendanceImporter
	include X2Importer

	def export_file_name
		'attendance_export.txt'
	end

	def parse_row(row)
		student = Student.where(state_id: row[:state_id]).first_or_create!
		attendance_event = AttendanceEvent.where(
			student_id: student.id,
			event_date: row[:event_date],
			absence: row[:absence],
			tardy: row[:tardy],
		).first_or_create!
	end
end
