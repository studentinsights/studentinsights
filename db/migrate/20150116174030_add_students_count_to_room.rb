class AddStudentsCountToRoom < ActiveRecord::Migration
  def change
    add_column :rooms, :students_count, :integer
  end
end
