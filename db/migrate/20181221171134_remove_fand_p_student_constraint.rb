class RemoveFandPStudentConstraint < ActiveRecord::Migration[5.2]
  def change
    remove_index :f_and_p_assessments, :student_id
    add_index :f_and_p_assessments, :student_id, unique: false
  end
end
