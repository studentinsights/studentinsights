module DataHelper

  MCAS_HEADERS = [
      "firstname", "lastname", "sasid",
      "grade", "race_off", "freelunch_off", 
      "sped_off", "escaleds", "eperf2", 
      "esgp", "mscaleds", "mperf2", "msgp"
  ]
  
  ACCESS_HEADERS = [ 
      "SGP", "makeprogress", "overalllevel"
  ]
  
  X2_HEADERS = [ 
      "NewID", "Grade", "HispanicLatino", 
      "Race", "Limited English Prof", "Low Income"
  ]

  HEADER_DICTIONARY = {

      # MCAS
      "escaleds" => :ela_scaled,
      "eperf2" => :ela_performance,
      "esgp" => :ela_growth,
      "mscaleds" => :math_scaled,
      "mperf2" => :math_performance,
      "msgp" => :math_growth,
      "sasid" => :state_identifier,
      "firstname" => :first_name, 
      "lastname" => :last_name,
      "grade" => :grade,
      "race_off" => :race,
      "freelunch_off" => :low_income,
      "sped_off" => :sped,

      # X2
      "NewID" => :new_id,
      "Grade" => :grade,
      "HispanicLatino" => :hispanic_latino,
      "Race" => :race,
      "Limited English Prof" => :limited_english,
      "Low Income" => :low_income,

      # ACCESS
      "SGP" => :access_growth,
      "makeprogress" => :access_progress,
      "overalllevel" => :access_performance
  }

  TO_BOOLEAN = { 
    0.0 => false,
    "0" => false,
    1.0 => true,
    "1" => true,
    "FALSE" => false,
    "TRUE" => true
  }

  FREE_REDUCED_LUNCH_TO_LOW_INCOME = {

    "Free Lunch" => true,
    "Reduced Lunch" => true,
    "Not Eligible" => false,
    "" => nil
  }

end