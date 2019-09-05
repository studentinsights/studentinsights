class IndexForActiveStudents < ActiveRecord::Migration[5.2]
  def change
    add_index :students, :missing_from_last_export
    add_index :students, :enrollment_status
  end
end
