require 'csv'

Student.destroy_all

path = "#{Rails.root}/data/mcas.csv"
healey = School.find_by_name("Arthur D Healey")
grade = "05"
importer = McasImporter.new(path, healey, grade).import

puts "#{Student.all.size} student records."
puts "#{Student.where(limited_english_proficient: true).size} limited English proficient."
puts "#{Student.where(former_limited_english_proficient: true).size} formerly limited English proficient."