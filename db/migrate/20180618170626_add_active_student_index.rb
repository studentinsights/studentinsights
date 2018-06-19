class AddActiveStudentIndex < ActiveRecord::Migration[5.1]
  def change
    add_index :students, :enrollment_status
  end
end
