class AddGradeToStudentSectionAssignment < ActiveRecord::Migration[5.1]
  def change
    add_column :student_section_assignments, :id, :primary_key
    add_column :student_section_assignments, :grade, :integer  
  end
end