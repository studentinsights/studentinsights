class DropNewIdAddHomeLangToStudents < ActiveRecord::Migration
  def change
    remove_column :students, :new_id
    add_column :students, :home_language, :string
  end
end
