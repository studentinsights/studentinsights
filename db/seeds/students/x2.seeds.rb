healey = School.find_by_name("Arthur D Healey")
grade = "04"
importer = X2Importer.new(healey, grade)
x2_data = importer.connect_to_x2
importer.import(x2_data[0], x2_data[1])
puts "#{Student.all.size} students."
puts "#{Homeroom.all.size} homerooms."