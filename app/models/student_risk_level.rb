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
    mcas_math_risk_level == this_level || star_math_risk_level == this_level \
    || mcas_ela_risk_level == this_level || star_reading_risk_level == this_level
  end

  def mcas_and_star_risk_nil?
    mcas_math_risk_level == nil && star_math_risk_level == nil \
    && mcas_ela_risk_level == nil && star_reading_risk_level == nil
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
    update_explanation
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

  def update_explanation
    explanations = case level
    when 3
       level_3_explanations
    when 2
       level_2_explanations
    when 1
       level_1_explanations
    when 0
       level_0_explanations
    when nil
       ["There is not enough information to tell."]
    end
    explanation = "#{name} is at Risk #{StudentRiskLevelPresenter.new(level).level_as_string} because:<br/><br/>"
    explanation += "<ul>" + explanations.map { |e| "<li>#{e}</li>" }.join + "</ul>"
    update_attributes(explanation: explanation)
  end

  private

  def name
    student.first_name || "This student"
  end

  def level_3_explanations
    explanations = []
    explanations << "#{name} is limited English proficient." if limited_english_proficiency_risk_level == 3
    explanations << "#{name}'s MCAS Math performance level is Warning." if mcas_math.risk_level == 3
    explanations << "#{name}'s STAR Math performance is in the warning range (below 10)." if star_math.risk_level == 3
    explanations << "#{name}'s MCAS English Language Arts performance level is Warning." if mcas_ela.risk_level == 3
    explanations << "#{name}'s STAR Reading performance is in the warning range (below 10)." if star_reading.risk_level == 3
    explanations
  end

  def level_2_explanations
    explanations = []
    explanations << "#{name}'s MCAS Math performance level is Needs Improvement." if mcas_math.risk_level == 2
    explanations << "#{name}'s STAR Math performance is in the 10-30 range." if star_math.risk_level == 2
    explanations << "#{name}'s MCAS English Language Arts performance level is Needs Improvement." if mcas_ela.risk_level == 2
    explanations << "#{name}'s STAR Reading performance is in the 10-30 range." if star_reading.risk_level == 2
    explanations
  end

  def level_1_explanations
    explanations = []
    explanations << "#{name}'s MCAS Math performance level is Proficient." if mcas_math.risk_level == 1
    explanations << "#{name}'s STAR Math performance is above 30." if star_math.risk_level == 1
    explanations << "#{name}'s MCAS English Language Arts performance level is Proficient." if mcas_ela.risk_level == 1
    explanations << "#{name}'s STAR Reading performance is above 30." if star_reading.risk_level == 1
    explanations
  end

  def level_0_explanations
    explanations = []
    explanations << "#{name}'s MCAS Math performance level is Advanced." if mcas_math.risk_level == 0
    explanations << "#{name}'s STAR Math performance is above 85." if star_math.risk_level == 0
    explanations << "#{name}'s MCAS English Language Arts performance level is Advanced." if mcas_ela.risk_level == 0
    explanations << "#{name}'s STAR Reading performance is above 85." if star_reading.risk_level == 0
    explanations
  end

end
