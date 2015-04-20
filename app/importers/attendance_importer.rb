class AttendanceImporter

  def connect_to_x2_attendance(grade_scope = nil, school_scope = nil)
    ActiveRecord::Base.establish_connection(:x2_database_development)
    @join_sql =	 "SELECT STD_OID, STD_ID_STATE, ATT_STD_OID, ATT_ABSENT_IND, ATT_TARDY_IND, ATT_DATE
									FROM student
									INNER JOIN student_attendance
										ON student.STD_OID=student_attendance.ATT_STD_OID
										AND STD_ENROLLMENT_STATUS = 'Active'
										AND STD_ID_STATE is not NULL
										AND STD_OID is not NULL"
    @join_sql += " AND STD_GRADE_LEVEL = '#{grade_scope}'" if grade_scope.present?
    @join_sql += " AND STD_SKL_OID = '#{school_scope}'" if school_scope.present?
    @join_result = ActiveRecord::Base.connection.exec_query(@join_sql).to_hash
    ActiveRecord::Base.connection.close
    ActiveRecord::Base.establish_connection(:development)
    return @join_result
  end

	def date_to_school_year(date_to_parse)
		# If month is Aug to Dec, current year is first half of school year
		# If month is Jan to Jul, current year is second half of school year

		date_array = date_to_parse.split("-")
		year = date_array[0].to_i
		month = date_array[1].to_i

		if month >= 8 && month <= 12
			school_year = "#{year}-#{year+1}"
		elsif month >= 1 && month <= 7
			school_year = "#{year-1}-#{year}"
		end
		return school_year
	end

	def aggregate_attendance_to_school_year(attendance_rows)
		# Return an array of hashes, each one describing attendance totals for school year:
		# [	{ 	school_year: "2014-2015",
		# 		number_of_absences: 22,
		# 		number_of_tardies: 33 		} ... ] 
		attendance_rows = attendance_rows.group_by { |row| date_to_school_year(row['ATT_DATE']) }
		attendance_rows.map { |k, v| 
			{
				school_year: k,
				number_of_absences: v.count { |row| row['ATT_ABSENT_IND'] == '1' },
				number_of_tardies: v.count { |row| row['ATT_TARDY_IND'] == '1' }
			}
		}
	end
end