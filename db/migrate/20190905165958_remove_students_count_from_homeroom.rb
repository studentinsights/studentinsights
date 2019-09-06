class RemoveStudentsCountFromHomeroom < ActiveRecord::Migration[5.2]
  def change
    remove_column :homerooms, :students_count, :integer, default: 0, null: false
  end
end
