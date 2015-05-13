class AttendanceImporter
  include X2Connector

	def attendance_headers
		[ 'absence', 'tardy', 'event_date' ]
	end

	def parse_row(row)
		student_state_id = row[1]
		attendance_info = row[3..5]
		student = Student.where(state_id: student_state_id).first_or_create!
		attendance_attributes = Hash[attendance_headers.zip(attendance_info)]

		attendance_event = AttendanceEvent.where(
			student_id: student.id,
			event_date: attendance_attributes['event_date'],
			absence: attendance_attributes['absence'],
			tardy: attendance_attributes['tardy'],
		).first_or_create!
	end
end