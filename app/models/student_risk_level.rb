class StudentRiskLevel < Struct.new :student
  delegate :latest_mcas, :latest_star, :limited_english_proficiency, to: :student
  delegate :full_name, :last_name, :first_name, to: :student_presenter

  def level
    # As defined by Somerville Public Schools

    if latest_mcas.risk_level == 3 || latest_star.risk_level == 3 || limited_english_proficiency == "Limited"
      3
    elsif latest_mcas.risk_level == 2 || latest_star.risk_level == 2
      2
    elsif latest_mcas.risk_level == 0 || latest_star.risk_level == 0
      0
    elsif latest_mcas.risk_level.nil? && latest_star.risk_level.nil?
      nil
    else
      1
    end
  end

  def level_in_words
    case level
    when 0, 1
      "Low"
    when 2
      "Medium"
    when 3
      "High"
    when nil
      "N/A"
    end
  end

  def explanation
    explanations = []

    case level
    when 3
      if limited_english_proficiency == "Limited"
        explanations << "#{first_name} is limited English proficient."
      end
      if latest_mcas.risk_level == 3
        explanations << "#{first_name}'s MCAS performance level is Warning."
      end
      if latest_star.risk_level == 3
        explanations << "#{first_name}'s STAR performance is in the warning range (below 10)."
      end
    when 2
      if latest_mcas.risk_level == 2
        explanations << "#{first_name}'s MCAS performance level is Needs Improvement."
      end
      if latest_star.risk_level == 2
        explanations << "#{first_name}'s STAR performance is in the 10-30 range."
      end
    when 1
      if latest_mcas.risk_level == 1
        explanations << "#{first_name}'s MCAS performance level is Proficient."
      end
      if latest_star.risk_level == 1
        explanations << "#{first_name}'s STAR performance is above 30."
      end
    when 0
      if latest_mcas.risk_level == 0
        explanations << "#{first_name}'s MCAS performance level is Advanced."
      end
      if latest_star.risk_level == 0
        explanations << "#{first_name}'s STAR performance is above 85."
      end
    when nil
      explanations << "There is not enough information to tell."
    end

    explanation = "#{full_name} is at #{level_in_words} Risk because:<br/><br/>"
    explanation += "<ul>" + explanations.map { |e| "<li>#{e}</li>" }.join + "</ul>"
  end

  def student_presenter
    StudentPresenter.new student
  end
end
