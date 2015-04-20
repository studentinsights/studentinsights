module FakeX2Attendance

	FAKE_STUDENT = {
		"STD_OID"=>"std000000000000"
	}

	def self.generate_row(date, tardy, absence)
		{
			"ATT_STD_OID"=>"std000000000000", 
			"ATT_SKL_OID"=>"SKL0000000000C", 
			"ATT_DATE"=>date, 
			"ATT_TARDY_IND"=>tardy, 
			"ATT_ABSENT_IND"=>absence	
		}
	end

	FAKE_ATTENDANCE_SEPTEMBER = {
   		"ATT_STD_OID"=>"std000000000000", 
		"ATT_SKL_OID"=>"SKL0000000000C", 
		"ATT_DATE"=>"2013-09-28", 
		"ATT_TARDY_IND"=>"0", 
		"ATT_ABSENT_IND"=>"0"
	}

	FAKE_ATTENDANCE_MARCH = {
   		"ATT_STD_OID"=>"std000000000000", 
		"ATT_SKL_OID"=>"SKL0000000000C", 
		"ATT_DATE"=>"2013-03-28", 
		"ATT_TARDY_IND"=>"0", 
		"ATT_ABSENT_IND"=>"0"
	}

end