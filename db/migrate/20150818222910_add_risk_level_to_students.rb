class AddRiskLevelToStudents < ActiveRecord::Migration
  def change
    add_column :students, :risk_level, :integer
  end
end
