class AddGradeToStudentSectionAssignment < ActiveRecord::Migration[5.1]
  def change
    add_column :student_section_assignments, :id, :primary_key
    add_column :student_section_assignments, :grade_numeric, :decimal 
    add_column :student_section_assignments, :grade_letter, :string   
  end
end