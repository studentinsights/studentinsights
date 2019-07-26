# typed: true
class AddMinimalFp < ActiveRecord::Migration[5.2]
  def change
    create_table :f_and_p_assessments do |t|
      t.integer :student_id, null: false
      t.date :benchmark_date, null: false # not the same as actual assessment date
      t.string :instructional_level, null: false
      t.string :f_and_p_code, null: true
      t.integer :uploaded_by_educator_id, null: false
      t.timestamps
    end
    add_foreign_key :f_and_p_assessments, :students
    add_foreign_key :f_and_p_assessments, :educators, column: :uploaded_by_educator_id
    add_index :f_and_p_assessments, :student_id, unique: true
    add_index :f_and_p_assessments, [:student_id, :benchmark_date]
  end
end
