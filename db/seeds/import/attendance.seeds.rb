after 'import:schools', 'import:x2' do
  puts "Importing attendance data from X2..."
  importer = AttendanceImporter.new
  attendance_rows = importer.connect_to_x2_attendance("SKL00000000009")
  puts "   #{attendance_rows.size} attendance rows from X2"
  aggregated_rows = importer.sort_attendance_rows_by_student_and_aggregate(attendance_rows)
  puts "   #{aggregated_rows.size} attendance rows aggregated by student"
end