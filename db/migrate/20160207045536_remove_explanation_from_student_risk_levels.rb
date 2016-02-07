class RemoveExplanationFromStudentRiskLevels < ActiveRecord::Migration
  def change
    remove_column :student_risk_levels, :explanation
  end
end
