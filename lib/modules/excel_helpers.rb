module ExcelHelpers 

  # List of headers needed to scrape data from Excel spreadsheet
  REQUIRED_HEADERS = [

      # X2
      "NewID", "Grade", "HispanicLatino", "Race", "Limited English Prof", "Low Income",

      # MCAS
      "sped_off", "escaleds", "eperf2", "esgp", "mscaleds", "mperf2", "msgp",

      # ACCESS
      "SGP", "makeprogress", "overalllevel"
  ]

  # Transform Excel column names into model attributes
  HEADER_DICTIONARY = {

      # X2
      "NewID" => :new_id,
      "Grade" => :grade,
      "HispanicLatino" => :hispanic_latino,
      "Race" => :race,
      "Limited English Prof" => :limited_english,
      "Low Income" => :low_income,

      # MCAS
      "sped_off" => :sped,
      "escaleds" => :ela_scaled,
      "eperf2" => :ela_performance,
      "esgp" => :ela_growth,
      "mscaleds" => :math_scaled,
      "mperf2" => :math_performance,
      "msgp" => :math_growth,

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