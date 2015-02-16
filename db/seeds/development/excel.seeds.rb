# Import Excel data
Student.destroy_all
xls = Roo::Excelx.new "./data/SampleData.xlsx"
DataSet.merge_sheets_and_write(xls)

# Assign students to homerooms
Room.destroy_all
n = 1 

students_by_grade = Student.with_demo_and_mcas_data.group_by(&:grade)

students_by_grade.each do |grade, grade_students|
  grade_students.each_slice(12).to_a.each do |homeroom|
    room = Room.create(name: "#{n}00")
    homeroom.each do |student|
      student.room_id = room.id
      unless student.save then raise end
      # puts "student #{student.id} assigned to room #{room.id}"
    end
    n += 1
  end
end