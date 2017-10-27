class StudentRiskLevel < ActiveRecord::Base
  belongs_to :student
  validates :student, presence: true, uniqueness: true
  delegate :student_assessments, :limited_english_proficiency, to: :student
  after_create :update_risk_level!

  # Use most recent assessments to calculate risk
  def mcas_math
    student.latest_result_by_family_and_subject("MCAS", "Mathematics") || MissingStudentAssessment.new
  end

  def star_math
    student.latest_result_by_family_and_subject("STAR", "Mathematics") || MissingStudentAssessment.new
  end

  def mcas_ela
    student.latest_result_by_family_and_subject("MCAS", "ELA") || MissingStudentAssessment.new
  end

  def star_reading
    student.latest_result_by_family_and_subject("STAR", "Reading") || MissingStudentAssessment.new
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
  end

  def calculate_level
    # As defined by Somerville Public Schools

    if student.school.try(:school_type) == "HS"
      #High School risk levels have not been defined
      level = nil
    elsif mcas_or_star_at_level(3) || limited_english_proficiency_risk_level == 3
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

  def level_as_string
    level.nil? ? "N/A" : level.to_s
  end

  # Data for Risk Level explanation:

  def risk_factors_to_levels
    {
      mcas_math_risk_level: mcas_math_risk_level,
      star_math_risk_level: star_math_risk_level,
      mcas_ela_risk_level: mcas_ela_risk_level,
      star_reading_risk_level: star_reading_risk_level,
      limited_english_proficiency_risk_level: limited_english_proficiency_risk_level
    }
  end

  def relevant_risk_factors
    risk_factors_to_levels.delete_if do |key, value|
      value != level
    end
  end

  def explanation
    { intro: explanation_intro_html, reasons: explanations_array }
  end

  def explanation_intro_html
    "#{name} is at Risk #{level_as_string} because:"
  end

  def name
    student.first_name || "This student"
  end

  def explanations_array
    return ["There is not enough information to tell."] if level == nil

    relevant_risk_factors.to_a.map do |key_value_pair|
      factor_name = key_value_pair[0]
      factor_value = key_value_pair[1]
      explanation = risk_factor_names_to_explanations[factor_name][factor_value]

      "#{name}#{explanation}."
    end
  end

  def risk_factor_names_to_explanations
    {
      limited_english_proficiency_risk_level: {
        3 => " is limited English proficient"
      },
      mcas_math_risk_level: {
        3 => "'s MCAS Math performance level is Warning",
        2 => "'s MCAS Math performance level is Needs Improvement",
        1 => "'s MCAS Math performance level is Proficient",
        0 => "'s MCAS Math performance level is Advanced"
      },
      mcas_ela_risk_level: {
        3 => "'s MCAS English Language Arts performance level is Warning",
        2 => "'s MCAS English Language Arts performance level is Needs Improvement",
        1 => "'s MCAS English Language Arts performance level is Proficient",
        0 => "'s MCAS English Language Arts performance level is Advanced"
      },
      star_reading_risk_level: {
        3 => "'s STAR Reading performance is in the warning range (below 10)",
        2 => "'s STAR Reading performance is in the 10-30 range",
        1 => "'s STAR Reading performance is above 30",
        0 => "'s STAR Reading performance is above 85"
      }, star_math_risk_level: {
        3 => "'s STAR Math performance is in the warning range (below 10)",
        2 => "'s STAR Math performance is in the 10-30 range",
        1 => "'s STAR Math performance is above 30",
        0 => "'s STAR Math performance is above 85"
      }
    }
  end

  def as_json_with_explanation
    as_json.merge(explanation: explanation)
  end
end
