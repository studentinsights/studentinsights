importer = X2Importer.new
x2_data = importer.connect_to_x2
importer.import(x2_data)
puts "#{Student.all.size} student records."