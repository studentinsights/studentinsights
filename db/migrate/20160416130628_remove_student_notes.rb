class RemoveStudentNotes < ActiveRecord::Migration
  def change
    drop_table :student_notes
  end
end
