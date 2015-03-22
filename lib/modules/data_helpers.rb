module DataHelper
  
  ACCESS_HEADERS = [ 
      "SGP", "makeprogress", "overalllevel"
  ]
  
  X2_HEADERS = [ 
      "NewID", "Grade", "HispanicLatino", 
      "Race", "Limited English Prof", "Low Income"
  ]

  X2_DICTIONARY = {
      "NewID" => :new_id,
      "Grade" => :grade,
      "HispanicLatino" => :hispanic_latino,
      "Race" => :race,
      "Limited English Prof" => :limited_english,
      "Low Income" => :low_income,
  }

  ACCESS_DICTIONARY = {    
      "SGP" => :access_growth,
      "makeprogress" => :access_progress,
      "overalllevel" => :access_performance
  }

  FREE_REDUCED_LUNCH_TO_LOW_INCOME = {

    "Free Lunch" => true,
    "Reduced Lunch" => true,
    "Not Eligible" => false,
    "" => nil
  }

end