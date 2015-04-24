after :schools, :x2, :attendance do
  puts "MCAS:"
  path = "#{Rails.root}/data/mcas2014.csv"
  healey = School.find_by_name("Arthur D Healey")
  grade = "04"
  year = Time.new(2014)
  Assessment.where(name: "MCAS", year: year).destroy_all

  if File.exist? path
    puts "   Importing MCAS data..."
    importer = McasImporter.new(path, healey, grade, year).import

    puts "#{McasResult.all.size} MCAS results."
  else 
    puts "   No MCAS data file found."
  end
end