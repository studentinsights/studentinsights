# typed: true
class StoreStudentRiskLevelFactors < ActiveRecord::Migration[4.2]
  def change
    add_column :student_risk_levels, :mcas_math_risk_level, :integer
    add_column :student_risk_levels, :star_math_risk_level, :integer
    add_column :student_risk_levels, :mcas_ela_risk_level, :integer
    add_column :student_risk_levels, :star_reading_risk_level, :integer
    add_column :student_risk_levels, :limited_english_proficiency_risk_level, :integer
  end
end
