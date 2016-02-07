class StudentRiskLevelDecorator < Draper::Decorator
  delegate_all

  def level_as_string
    level.nil? ? "N/A" : level.to_s
  end

  def css_class_name
    "risk-" + level_as_string.downcase.gsub("/", "")
  end

  def name
    student.first_name || "This student"
  end

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
    explanation_intro_html + explanations_array_html_list
  end

  def explanation_intro_html
    "#{name} is at Risk #{level_as_string} because:<br/><br/>"
  end

  def explanations_array
    return ["There is not enough information to tell."] if level == nil

    relevant_risk_factors.to_a.map do |key_value_pair|
      factor_name, value = key_value_pair[0], key_value_pair[1]
      explanation_phrase(factor_name, value)
    end
  end

  def explanation_phrase(factor_name, value)
    "#{name}#{risk_factor_names_to_explanations[factor_name][value]}."
  end

  def explanations_array_html_list
    "<ul>" + explanations_array.map { |e| "<li>#{e}</li>" }.join + "</ul>"
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
end
