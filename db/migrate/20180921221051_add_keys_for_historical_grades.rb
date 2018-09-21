class AddKeysForHistoricalGrades < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "historical_grades", "sections", name: "historical_grades_section_id_fk"
    add_foreign_key "historical_grades", "students", name: "historical_grades_student_id_fk"
  end
end
