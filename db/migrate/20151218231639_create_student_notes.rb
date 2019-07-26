# typed: true
class CreateStudentNotes < ActiveRecord::Migration[4.2]
  def change
    create_table :student_notes do |t|
      t.integer :student_id
      t.text :content
      t.integer :educator_id

      t.timestamps
    end
  end
end
