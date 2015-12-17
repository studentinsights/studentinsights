class AttendanceQueries < Struct.new :school

  def top_5_absence_concerns_serialized
    top_5_absence_concerns.map do |student|
      {
        name: StudentPresenter.new(student).full_name,
        absences: student.absences_count_most_recent_school_year,
        id: student.id
      }
    end
  end

  def top_5_tardy_concerns_serialized
    top_5_tardy_concerns.map do |student|
      {
        name: StudentPresenter.new(student).full_name,
        tardies: student.tardies_count_most_recent_school_year,
        id: student.id
      }
    end
  end

  private

  def top_5_absence_concerns
    school.students.order(absences_count_most_recent_school_year: :desc).limit(5)
  end

  def top_5_tardy_concerns
    school.students.order(tardies_count_most_recent_school_year: :desc).limit(5)
  end

end
