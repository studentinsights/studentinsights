require 'csv'

Student.destroy_all
path = "#{Rails.root}/data/mcas.csv"
importer = McasImporter.new(path).import
puts "#{Student.all.size} student records."