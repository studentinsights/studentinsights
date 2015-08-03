class AttendanceImporter
  include Importer

  def remote_file_name
    'attendance_export.txt'
  end

  def import_row(row)
    require 'date'
    if row[:event_date].present?
      begin
        Date.parse row[:event_date] unless row[:event_date].is_a? DateTime
        student = Student.where(local_id: row[:local_id]).first_or_create!
        attendance_event = AttendanceEvent.where(
          student_id: student.id,
          event_date: row[:event_date],
          absence: row[:absence],
          tardy: row[:tardy],
        ).first_or_create!
      rescue ArgumentError
      end
    end
  end
end


