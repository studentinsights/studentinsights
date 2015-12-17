class IncomeMcasMathQueries < Struct.new :school

  def percent_low_income_with_warning
    return nil if low_income_students_with_mcas_math.blank?
    fraction = low_income_students_with_mcas_math_warning.count.to_f / low_income_students_with_mcas_math.count.to_f
    (fraction * 100.0).round(2)
  end

  def percent_not_low_income_with_warning
    return nil if not_low_income_students_with_mcas_math.blank?
    fraction = not_low_income_students_with_mcas_math_warning.count.to_f / not_low_income_students_with_mcas_math.count.to_f
    (fraction * 100.0).round(2)
  end

  def not_low_income_students_with_mcas_math
    school.students.not_low_income.with_mcas_math
  end

  def low_income_students_with_mcas_math
    school.students.low_income.with_mcas_math
  end

  def low_income_students_with_mcas_math_warning
    school.students.low_income.with_mcas_math_warning
  end

  def not_low_income_students_with_mcas_math_warning
    school.students.not_low_income.with_mcas_math_warning
  end

end
