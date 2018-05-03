class ClassroomBalancingKeys < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key "classrooms_for_grades", "schools", name: "classrooms_for_grades_school_id_fk"
  end
end
