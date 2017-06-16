class AttendanceRow < Struct.new(:row)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  #
  # Expects the following headers:
  #
  # :state_id, :local_id, :absence, :tardy, :event_date, :school_local_id

  class NullRelation
    class NullEvent
      def save!; end
      def assign_attributes(_); end
    end

    def find_or_initialize_by(_)
      NullEvent.new
    end
  end

  def self.build(row)
    new(row).build
  end

  def build
    attendance_event = attendance_event_class.find_or_initialize_by(
      occurred_at: row[:event_date]
    )

    return attendance_event
  end

  private

  def attendance_event_class
    return student.absences if row[:absence].to_i == 1
    return student.tardies if row[:tardy].to_i == 1
    NullRelation.new
  end

  def student
    Student.find_by_local_id!(row[:local_id])
  end

end
