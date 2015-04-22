path = "#{Rails.root}/data/mcas2014.csv"
healey = School.find_by_name("Arthur D Healey")
grade = "04"
year = Time.new(2014)
Assessment.where(name: "MCAS", year: year).destroy_all

if File.exist? path
  importer = McasImporter.new(path, healey, grade, year).import

  puts "#{Student.all.size} students."
  puts "#{Assessment.all.size} assessments."
  puts "#{McasResult.all.size} student results."
  puts "#{Student.where(limited_english_proficient: true).size} limited English proficient."
  puts "#{Student.where(former_limited_english_proficient: true).size} formerly limited English proficient."
end