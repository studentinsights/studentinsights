importer = AttendanceImporter.new
attendance_rows = importer.connect_to_x2_attendance("05", "SKL00000000009")
puts "#{attendance_rows.size} attendance rows from X2"
aggregated_rows = importer.sort_attendance_rows_by_student_and_aggregate(attendance_rows)
puts "#{aggregated_rows.size} rows aggregated by student"