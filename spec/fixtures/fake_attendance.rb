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
		state_identifier: "123updateme",
		school_year: "2014-2015",
		number_of_absences: 2,
		number_of_tardies: 3
	}

	FAKE_ATTENDANCE_SEPTEMBER = {
		"ATT_DATE" => "2013-09-28"
	}

	FAKE_ATTENDANCE_MARCH = {
		"ATT_DATE" => "2013-03-28"
	}

end