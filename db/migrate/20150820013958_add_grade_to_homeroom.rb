class AddGradeToHomeroom < ActiveRecord::Migration
  def change
    add_column :homerooms, :grade, :string
  end
end
