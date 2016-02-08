class AttendanceRow < Struct.new(:row)
  class NullRelation
    class NullEvent
      def save!; end
    end

    def first_or_initialize(_)
      NullEvent.new
    end
  end

  def self.build(row)
    new(row).build
  end

  def build
    attendance_event_class.first_or_initialize(occurred_at: row[:event_date])
  end

  private

  def attendance_event_class
    return student_school_year.absences if row[:absence]
    return student_school_year.tardies if row[:tardy]
    NullRelation.new
  end

  def student
    Student.find_by_local_id! row[:local_id]
  end

  def school_year
    DateToSchoolYear.new(row[:event_date]).convert
  end

  def student_school_year
    student.student_school_years.find_or_create_by(school_year: school_year)
  end
end
