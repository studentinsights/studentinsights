class StudentRowData

  attr_accessor :assessments, :latest_mcas, :latest_star, :current_events,
    :latest_mcas_math, :latest_mcas_ela, :latest_star_math, :latest_star_reading,
    :latest_map_test, :latest_dibels, :latest_access

  def initialize(student, school_year)
    @student = student

    @latest_star = Assessment.star.student_assessments.find_by_student(student).last_or_missing
    @latest_mcas = Assessment.mcas.student_assessments.find_by_student(student).last_or_missing
    @latest_mcas_math = Assessment.mcas_math.student_assessments.find_by_student(student).last_or_missing
    @latest_mcas_ela = Assessment.mcas_ela.student_assessments.find_by_student(student).last_or_missing
    @latest_star_math = Assessment.star_math.student_assessments.find_by_student(student).last_or_missing
    @latest_star_reading = Assessment.star_reading.student_assessments.find_by_student(student).last_or_missing
    @latest_map_test = Assessment.map_test.student_assessments.find_by_student(student).last_or_missing
    @latest_dibels = Assessment.dibels.student_assessments.find_by_student(student).last_or_missing
    @latest_access = Assessment.access.student_assessments.find_by_student(student).last_or_missing

    @school_year = school_year
    @current_events = @school_year.attendance_discipline_events(@student)
  end

  def risk
    StudentRiskLevel.new({
      student: @student,
      latest_mcas: @latest_mcas,
      latest_star: @latest_star
    })
  end

  def absences_current_year
    @current_events[:attendance_events_summary][:absences]
  end

  def tardies_current_year
    @current_events[:attendance_events_summary][:tardies]
  end

  def discipline_current_year
    @current_events[:discipline_incidents_count]
  end

end
