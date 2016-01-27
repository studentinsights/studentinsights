class AttendanceQueries < Struct.new :school

  def top_5_absence_concerns_serialized
    absent_students.limit(5).map do |student|
      {
        name: StudentPresenter.new(student).full_name,
        result_value: student.student_school_years.first.absences_count,
        interventions_count: student.student_school_years.first.interventions.count,
        id: student.id
      }
    end
  end

  def top_5_tardy_concerns_serialized
    tardy_students.limit(5).map do |student|
      {
        name: StudentPresenter.new(student).full_name,
        result_value: student.student_school_years.first.tardies_count,
        interventions_count: student.student_school_years.first.interventions.count,
        id: student.id
      }
    end
  end

  def absent_students
    current_students
      .where.not(student_school_years: {absences_count: 0})
      .order('student_school_years.absences_count DESC')
      .references(:student_school_years)
  end

  def tardy_students
    current_students
      .where.not(student_school_years: {tardies_count: 0})
      .order('student_school_years.tardies_count DESC')
      .references(:student_school_years)
  end

  def current_students
    current_school_year = SchoolYear.order(start: :desc).first
    school.students
          .includes(:student_school_years)
          .where(student_school_years: { school_year: current_school_year })
  end
end
