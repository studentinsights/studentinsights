class RemoveRiskLevel < ActiveRecord::Migration[5.2]
  def change
    drop_table :student_risk_levels

    remove_column :students, :risk_level
  end
end
