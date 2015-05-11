puts "X2 DEMOGRAPHICS:"
after 'import:schools' do
  puts "   Importing demographic data from X2..."
  healey = School.find_by_name("Arthur D Healey")
  grade = "05"
  importer = X2Importer.new(healey, grade)
  x2_data = importer.connect_to_x2
  importer.import(x2_data[0], x2_data[1])
  puts "   #{Student.all.size} students imported from X2."
  puts "   #{Homeroom.all.size} homerooms imported from X2."
end