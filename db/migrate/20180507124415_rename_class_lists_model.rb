class RenameClassListsModel < ActiveRecord::Migration[5.1]
  def change
    rename_table :classrooms_for_grades, :class_lists
    rename_column :class_lists, :balance_id, :workspace_id
    add_column :class_lists, :submitted, :boolean, default: false
  end
end
