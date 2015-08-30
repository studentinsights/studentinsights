class StudentRiskLevel < ActiveRecord::Base
  belongs_to :student
  delegate :student_assessments, :limited_english_proficiency, to: :student
  after_create :update_risk_level!

  # Use most recent assessments to calculate risk
  def mcas_math; student_assessments.latest_mcas_math end
  def star_math; student_assessments.latest_star_math end
  def mcas_ela; student_assessments.latest_mcas_ela end
  def star_reading; student_assessments.latest_star_reading end

  def mcas_or_star_at_level(level)
    mcas_math.risk_level == level || star_math.risk_level == level \
    || mcas_ela.risk_level == level || star_reading.risk_level == level
  end

  def mcas_and_star_risk_nil?
    mcas_math.risk_level == nil && star_math.risk_level == nil \
    && mcas_ela.risk_level == nil && star_reading.risk_level == nil
  end

  def update_risk_level!
    calculate_level
    update_explanation
  end

  def calculate_level
    # As defined by Somerville Public Schools

    if mcas_or_star_at_level(3) || limited_english_proficiency == "Limited"
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

    update_attributes(level: level)
  end

  def update_explanation
    explanations = []
    name = student.first_name || "This student"

    case level
    when 3
      if limited_english_proficiency == "Limited"
        explanations << "#{name} is limited English proficient."
      end
      if mcas_math.risk_level == 3
        explanations << "#{name}'s MCAS Math performance level is Warning."
      end
      if star_math.risk_level == 3
        explanations << "#{name}'s STAR Math performance is in the warning range (below 10)."
      end
      if mcas_ela.risk_level == 3
        explanations << "#{name}'s MCAS English Language Arts performance level is Warning."
      end
      if star_reading.risk_level == 3
        explanations << "#{name}'s STAR Reading performance is in the warning range (below 10)."
      end
    when 2
      if mcas_math.risk_level == 2
        explanations << "#{name}'s MCAS Math performance level is Needs Improvement."
      end
      if star_math.risk_level == 2
        explanations << "#{name}'s STAR Math performance is in the 10-30 range."
      end
      if mcas_ela.risk_level == 2
        explanations << "#{name}'s MCAS English Language Arts performance level is Needs Improvement."
      end
      if star_reading.risk_level == 2
        explanations << "#{name}'s STAR Reading performance is in the 10-30 range."
      end
    when 1
      if mcas_math.risk_level == 1
        explanations << "#{name}'s MCAS Math performance level is Proficient."
      end
      if star_math.risk_level == 1
        explanations << "#{name}'s STAR Math performance is above 30."
      end
      if mcas_ela.risk_level == 1
        explanations << "#{name}'s MCAS English Language Arts performance level is Proficient."
      end
      if star_reading.risk_level == 1
        explanations << "#{name}'s STAR Reading performance is above 30."
      end
    when 0
      if mcas_math.risk_level == 0
        explanations << "#{name}'s MCAS Math performance level is Advanced."
      end
      if star_math.risk_level == 0
        explanations << "#{name}'s STAR Math performance is above 85."
      end
      if mcas_ela.risk_level == 0
        explanations << "#{name}'s MCAS English Language Arts performance level is Advanced."
      end
      if star_reading.risk_level == 0
        explanations << "#{name}'s STAR Reading performance is above 85."
      end
    when nil
      explanations << "There is not enough information to tell."
    end

    explanation = "#{name} is at Risk #{StudentRiskLevelPresenter.new(level).level_as_string} because:<br/><br/>"
    explanation += "<ul>" + explanations.map { |e| "<li>#{e}</li>" }.join + "</ul>"
    update_attributes(explanation: explanation)
  end

end
