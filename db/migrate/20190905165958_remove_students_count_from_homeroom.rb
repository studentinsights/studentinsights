class RemoveStudentsCountFromHomeroom < ActiveRecord::Migration[5.2]
  def change
    remove_column :homerooms, :students_count
  end
end
