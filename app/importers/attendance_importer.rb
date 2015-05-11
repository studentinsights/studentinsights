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

  def create_or_update_attendance_result(parsed_attendance_result, student)
    if student.present?
      school_year = parsed_attendance_result[:school_year]
      result = AttendanceResult.where(student_id: student.id, school_year: school_year).first_or_create!
      result.update(parsed_attendance_result.except(:state_id))
      return result
    end
  end

  def aggregate_attendance_to_school_year(student, attendance_rows)
    # Creates an array of hashes, each one describing attendance totals for school year:
    # [ {   school_year: "2014-2015",
    #       number_of_absences: 22,
    #       number_of_tardies: 33     } ... ] 
    # And then passes those hashes on to create_or_update_attendance_result
    attendance_rows = attendance_rows.group_by { |row| date_to_school_year(row['ATT_DATE']) }
    attendance_rows = attendance_rows.map { |school_year, rows| 
        {
          :school_year => school_year,
          :number_of_absences => rows.count { |row| row['ATT_ABSENT_IND'] == '1' },
          :number_of_tardies => rows.count { |row| row['ATT_TARDY_IND'] == '1' }
        }
    }
    attendance_rows.each do |row|
      create_or_update_attendance_result(row, student)
    end
  end

  def sort_attendance_rows_by_student_and_aggregate(attendance_rows)
    # Creates a hash, with student objects as keys and attendance rows as values: 
    # {   Student1 => [ attendance_rows ... ],
    #     Student2 => [ attendance_rows ... ], ...  }
    # And then passes the values in that hash into aggregate_attendance_to_school_year
    attendance_rows = attendance_rows.group_by { |row| Student.find_by_state_id(row['STD_ID_STATE']) }
    attendance_rows.each do |student, rows|
      aggregate_attendance_to_school_year(student, rows)
    end
    return attendance_rows
  end
end