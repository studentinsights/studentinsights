require 'csv'

path = "./data/mcas.csv"

if File.exist? path
  csv = CSV.read(path)
  headers = csv[0]
  header_indicies = {} 
  last_row = csv.size - 1

  headers.each do |h|                               # Gather relevant headers, get their indices, store in hash
    if DataHelper::MCAS_HEADERS.include? h
      header_index = headers.index(h)
      new_name = DataHelper::HEADER_DICTIONARY[h]
      header_indicies[header_index] = new_name
    end
  end
  columns_to_get = header_indicies.keys

  (1..last_row).each do |row| 
    new_student = Student.new                       # Assumption here that each row represents a new, unique student
    student_info = csv[row]

    columns_to_get.each do |c|
      value = student_info[c]
      attribute_name = header_indicies[c]
      new_student.send("#{attribute_name}=", value)
    end
    new_student.save

  end
end