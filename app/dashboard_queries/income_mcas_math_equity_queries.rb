class IncomeMcasMathEquityQueries

  def percent_of_low_income_students_with_mcas_math_warning
    return nil if low_income_students_with_mcas_math.blank?
    low_income_students_with_mcas_math_warning.count.to_f / low_income_students_with_mcas_math.count.to_f * 100.0
  end

  def percent_of_not_low_income_students_with_mcas_math_warning
    return nil if not_low_income_students_with_mcas_math.blank?
    not_low_income_students_with_mcas_math_warning.count.to_f / not_low_income_students_with_mcas_math.count.to_f * 100.0
  end

  def not_low_income_students_with_mcas_math
    Student.not_low_income.with_mcas_math
  end

  def low_income_students_with_mcas_math
    Student.low_income.with_mcas_math
  end

  def low_income_students_with_mcas_math_warning
    Student.low_income.with_mcas_math_warning
  end

  def not_low_income_students_with_mcas_math_warning
    Student.not_low_income.with_mcas_math_warning
  end

end
