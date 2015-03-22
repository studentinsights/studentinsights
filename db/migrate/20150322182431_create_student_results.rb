class CreateStudentResults < ActiveRecord::Migration
  def change
    create_table :student_results do |t|
      t.integer :ela_scaled
      t.string :ela_performance
      t.integer :ela_growth
      t.integer :math_scaled
      t.string :math_performance
      t.integer :math_growth
      t.integer :assessment_id
      t.integer :student_id

      t.timestamps
    end
  end
end
