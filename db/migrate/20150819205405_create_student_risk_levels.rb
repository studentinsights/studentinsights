class CreateStudentRiskLevels < ActiveRecord::Migration
  def change
    create_table :student_risk_levels do |t|
      t.integer :student_id
      t.text :explanation
      t.integer :level

      t.timestamps
    end
  end
end
