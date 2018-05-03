class ClassroomBalancingEducatorKey < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key "classrooms_for_grades", "educators", {
      column: 'created_by_educator_id',
      name: 'classrooms_for_created_by_educator_id_fk'
    }
  end
end
