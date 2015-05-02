module FakeX2Attendance

	def self.generate_row(student_state_id, date, tardy, absence)
		{
			"STD_ID_STATE" => student_state_id,
			"ATT_DATE" => date,
			"ATT_TARDY_IND" => tardy,
			"ATT_ABSENT_IND" => absence
		}
	end

	FAKE_PARSED_ATTENDANCE_RESULT = {
		state_id: "student_with_attendance_result",
		school_year: "2014-2015",
		number_of_absences: 2,
		number_of_tardies: 3
	}

end