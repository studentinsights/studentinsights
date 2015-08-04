class StudentRowData

  attr_accessor :assessments, :latest_mcas, :latest_star, :current_events,
    :latest_mcas_math, :latest_mcas_ela, :latest_star_math, :latest_star_reading

  def initialize(student, school_year)
    @student = student
    @assessments = @student.assessments

    star = @assessments.star
    mcas = @assessments.mcas

    @latest_mcas = mcas.last || MissingAssessment.new
    @latest_star = star.last || MissingAssessment.new
    @latest_mcas_math = mcas.math.last || MissingAssessment.new
    @latest_mcas_ela = mcas.ela.last || MissingAssessment.new
    @latest_star_math = star.math.last || MissingAssessment.new
    @latest_star_reading = star.reading.last || MissingAssessment.new

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
    @current_events[:attendance_events][:absences]
  end

  def tardies_current_year
    @current_events[:attendance_events][:tardies]
  end

  def discipline_current_year
    @current_events[:discipline_incidents].count
  end

end
