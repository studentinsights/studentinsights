class AttendanceRow < Struct.new(:row, :student_id, :record_class)
  # Matches a row from a CSV export with an Insights record.
  def build
    attendance_event = record_class.find_or_initialize_by(
      occurred_at: row[:event_date],
      student_id: student_id,
    )

    # There are some additional fields for some districts.
    if PerDistrict.new.import_detailed_attendance_fields?
      attendance_event.assign_attributes(
        dismissed: row[:dismissed],
        excused: row[:excused],
        reason: row[:reason],
        comment: row[:comment],
      )
    end

    attendance_event
  end
end
