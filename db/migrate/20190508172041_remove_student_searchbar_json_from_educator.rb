class RemoveStudentSearchbarJsonFromEducator < ActiveRecord::Migration[5.2]
  def change
    remove_column :educators, :student_searchbar_json
  end
end
