# typed: true
class RemoveExplanationFromStudentRiskLevels < ActiveRecord::Migration[4.2]
  def change
    remove_column :student_risk_levels, :explanation
  end
end
