if School.all.size == 0
	School.create([
		{state_id: 15, name: "Benjamin G Brown", school_type: "ES"	},
		{state_id: 75, name: "Arthur D Healey", school_type: "ESMS"	},
		{state_id: 83, name: "John F Kennedy", school_type: "ESMS"	},
		{state_id: 87, name: "Albert F. Argenziano School", school_type: "ESMS"	},
		{state_id: 111, name: "E Somerville Community", school_type: "ESMS"	},
		{state_id: 115, name: "West Somerville Neighborhood", school_type: "ESMS"	},
		{state_id: 120, name: "Winter Hill Community", school_type: "ESMS"	},
		{state_id: 410, name: "Next Wave Junior High", school_type: "MS"	},
		{state_id: 505, name: "Somerville High", school_type: "HS"	},
		{state_id: 510, name: "Full Circle High School", school_type: "HS"	}
	])
end