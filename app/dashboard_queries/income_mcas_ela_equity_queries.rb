class IncomeMcasElaEquityQueries

  def percent_of_low_income_students_with_mcas_ela_warning
    return nil if low_income_students_with_mcas_ela.blank?
    low_income_students_with_mcas_ela_warning.count.to_f / low_income_students_with_mcas_ela.count.to_f * 100.0
  end

  def percent_of_not_low_income_students_with_mcas_ela_warning
    return nil if not_low_income_students_with_mcas_ela.blank?
    not_low_income_students_with_mcas_ela_warning.count.to_f / not_low_income_students_with_mcas_ela.count.to_f * 100.0
  end

  def not_low_income_students_with_mcas_ela
    Student.not_low_income.with_mcas_ela
  end

  def low_income_students_with_mcas_ela
    Student.low_income.with_mcas_ela
  end

  def low_income_students_with_mcas_ela_warning
    Student.low_income.with_mcas_ela_warning
  end

  def not_low_income_students_with_mcas_ela_warning
    Student.not_low_income.with_mcas_ela_warning
  end

end
