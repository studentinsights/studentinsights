# typed: true
class RemoveStudentNotes < ActiveRecord::Migration[4.2]
  def change
    drop_table :student_notes
  end
end
