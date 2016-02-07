class StudentRiskLevel < ActiveRecord::Base
  belongs_to :student
  delegate :student_assessments, :limited_english_proficiency, to: :student
  after_create :update_risk_level!

  # Use most recent assessments to calculate risk
  def mcas_math
    student.latest_result_by_family_and_subject("MCAS", "Math") || MissingStudentAssessment.new
  end

  def star_math
    student.latest_result_by_family_and_subject("STAR", "Math") || MissingStudentAssessment.new
  end

  def mcas_ela
    student.latest_result_by_family_and_subject("MCAS", "ELA") || MissingStudentAssessment.new
  end

  def star_reading
    student.latest_result_by_family_and_subject("STAR", "ELA") || MissingStudentAssessment.new
  end

  def mcas_or_star_at_level(this_level)
    student_assessment_factors.any? { |risk_level| risk_level == this_level }
  end

  def mcas_and_star_risk_nil?
    student_assessment_factors.all? { |risk_level| risk_level.nil? }
  end

  def student_assessment_factors
    [ mcas_math_risk_level, star_math_risk_level, mcas_ela_risk_level, star_reading_risk_level ]
  end

  def risk_level_factors
    student_assessment_factors << limited_english_proficiency_risk_level
  end

  def limited_english_proficiency_risk_level
    return 3 if limited_english_proficiency == "Limited"
  end

  def update_risk_level!
    update!(
      mcas_math_risk_level: mcas_math.risk_level,
      star_math_risk_level: star_math.risk_level,
      mcas_ela_risk_level: mcas_ela.risk_level,
      star_reading_risk_level: star_reading.risk_level,
      limited_english_proficiency_risk_level: limited_english_proficiency_risk_level
    )

    update!(level: calculate_level)
    update!(explanation: explanation)
  end

  def calculate_level
    # As defined by Somerville Public Schools

    if mcas_or_star_at_level(3) || limited_english_proficiency_risk_level == 3
      level = 3
    elsif mcas_or_star_at_level(2)
      level = 2
    elsif mcas_or_star_at_level(0)
      level = 0
    elsif mcas_and_star_risk_nil?
      level = nil
    else
      level = 1
    end
  end

end
