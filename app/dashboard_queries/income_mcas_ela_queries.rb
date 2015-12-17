class IncomeMcasElaQueries < Struct.new :school

  def percent_low_income_with_warning
    return nil if low_income_students_with_mcas_ela.blank?
    fraction = low_income_students_with_mcas_ela_warning.count.to_f / low_income_students_with_mcas_ela.count.to_f
    (fraction * 100.0).round(2)
  end

  def percent_not_low_income_with_warning
    return nil if not_low_income_students_with_mcas_ela.blank?
    fraction = not_low_income_students_with_mcas_ela_warning.count.to_f / not_low_income_students_with_mcas_ela.count.to_f
    (fraction * 100.0).round(2)
  end

  def not_low_income_students_with_mcas_ela
    school.students.not_low_income.with_mcas_ela
  end

  def low_income_students_with_mcas_ela
    school.students.low_income.with_mcas_ela
  end

  def low_income_students_with_mcas_ela_warning
    school.students.low_income.with_mcas_ela_warning
  end

  def not_low_income_students_with_mcas_ela_warning
    school.students.not_low_income.with_mcas_ela_warning
  end

end
