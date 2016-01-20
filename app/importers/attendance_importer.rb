class AttendanceImporter
  include Connector
  include Importer

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "absence", "tardy", "event_date", "school_local_id" ]

    'attendance_export.txt'
  end

  def import_row(row)
    student = Student.where(local_id: row[:local_id]).first_or_create!
    attendance_event = AttendanceEvent.where(
      student_id: student.id,
      event_date: row[:event_date],
      absence: row[:absence],
      tardy: row[:tardy],
    ).first_or_create!
  end
end


