class StudentRowData

  attr_accessor :assessments, :latest_mcas, :latest_star,
    :latest_mcas_math, :latest_mcas_ela, :latest_star_math, :latest_star_reading

  def initialize(student)
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
  end

  def risk
    StudentRiskLevel.new({
      student: @student,
      latest_mcas: @latest_mcas,
      latest_star: @latest_star
    })
  end

end
