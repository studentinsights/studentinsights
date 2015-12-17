class School < ActiveRecord::Base
  has_many :students

  def equity_data
    income_mcas_ela_queries = IncomeMcasElaQueries.new(self)
    income_mcas_math_queries = IncomeMcasMathQueries.new(self)
    attendance_queries = AttendanceQueries.new(self)

    return {
      mcas: {
        math: {
          percent_low_income_warning: income_mcas_math_queries.percent_low_income_with_warning,
          percent_not_low_income_warning: income_mcas_math_queries.percent_not_low_income_with_warning,
        },
        ela: {
          percent_low_income_warning: income_mcas_ela_queries.percent_low_income_with_warning,
          percent_not_low_income_warning: income_mcas_ela_queries.percent_not_low_income_with_warning,
        }
      },
      attendance: {
        top_absence_concerns: attendance_queries.top_5_absence_concerns_serialized,
        top_tardy_concerns: attendance_queries.top_5_tardy_concerns_serialized
      }
    }
  end

  def self.seed_somerville_schools
    School.create([
      { state_id: 15, local_id: "BRN", name: "Benjamin G Brown", school_type: "ES" },
      { state_id: 75, local_id: "HEA", name: "Arthur D Healey", school_type: "ESMS" },
      { state_id: 83, local_id: "KDY", name: "John F Kennedy", school_type: "ESMS" },
      { state_id: 87, local_id: "AFAS", name: "Albert F. Argenziano School", school_type: "ESMS" },
      { state_id: 111, local_id: "ESCS", name: "E Somerville Community", school_type: "ESMS" },
      { state_id: 115, local_id: "WSNS", name: "West Somerville Neighborhood", school_type: "ESMS" },
      { state_id: 120, local_id: "WHCS", name: "Winter Hill Community", school_type: "ESMS" },
      { state_id: 410, local_id: "NW", name: "Next Wave Junior High", school_type: "MS" },
      { state_id: 505, local_id: "SHS", name: "Somerville High", school_type: "HS" },
      { state_id: 510, local_id: "FC", name: "Full Circle High School", school_type: "HS" }
    ])
  end

end
