class AddStudentSectionConstraints < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "student_section_assignments", "students", name: "student_section_assignments_student_id_fk"
    add_foreign_key "student_section_assignments", "sections", name: "student_section_assignments_section_id_fk"
  end
end
