class AddStudentNamesForSearchbarToEducator < ActiveRecord::Migration[5.1]
  def change
    add_column :educators, :student_searchbar_json, :text
  end
end
