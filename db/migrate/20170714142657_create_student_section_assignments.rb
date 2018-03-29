class CreateStudentSectionAssignments < ActiveRecord::Migration[5.0]
  def change
    create_table :student_section_assignments, id: false do |t|
      t.belongs_to :section, index: true, foreign_key: true
      t.belongs_to :student, index: true, foreign_key: true
    end
  end
end
