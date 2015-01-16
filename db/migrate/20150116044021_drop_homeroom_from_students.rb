class DropHomeroomFromStudents < ActiveRecord::Migration
  def change
    remove_column :students, :homeroom
    remove_column :rooms, :students_count
  end
end
