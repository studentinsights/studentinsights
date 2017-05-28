class AttendanceRow < Struct.new(:row)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  #
  # Expects the following headers:
  #
  # :state_id, :local_id, :absence, :tardy, :event_date, :school_local_id

  class NullRelation
    class NullEvent
      def save!; end
    end

    def find_or_initialize_by(_)
      NullEvent.new
    end
  end

  def self.build(row)
    new(row).build
  end

  def build
    attendance_event_class.find_or_initialize_by(
      occurred_at: row[:event_date]
    )
  end

  private

  def attendance_event_class
    return student_school_year.absences if row[:absence].to_i == 1
    return student_school_year.tardies if row[:tardy].to_i == 1
    NullRelation.new
  end

  def student
    Student.find_by_local_id!(row[:local_id])
  end

  def school_year
    DateToSchoolYear.new(row[:event_date]).convert
  end

  def student_school_year
    student.student_school_years.find_or_create_by(school_year: school_year)
  end
end
