# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

# Import Excel data
Student.destroy_all
xls = Roo::Excelx.new "./spec/SampleData/SampleData.xlsx"
DataSet.merge_sheets_and_write(xls)

# Generate homerooms and assign students
Room.destroy_all
number_of_students = Student.all.size
((number_of_students / 12) + 1).times do 
  room = Room.create(name: "#{rand(999)}0")
  12.times do 
    s = Student.where(room_id: nil).sample
    s.room_id = room.id
    s.save
  end
end