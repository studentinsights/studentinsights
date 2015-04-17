class AttendanceImporter

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
end