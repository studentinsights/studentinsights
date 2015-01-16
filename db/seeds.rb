# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

# Import Excel data
# Student.destroy_all
# xls = Roo::Excelx.new "./spec/SampleData/SampleData.xlsx"
# DataSet.merge_sheets_and_write(xls)

# Assign students to homerooms
Room.destroy_all
n = 1 

Student.all.shuffle.each_slice(12).to_a.each do |student_group|
  room = Room.create(name: "#{n}00")
  student_group.each do |student|
    student.room_id = room.id
    unless student.save
      raise
    end
  end
  n += 1
end