# typed: true
class AddGradeToHomeroom < ActiveRecord::Migration[4.2]
  def change
    add_column :homerooms, :grade, :string
  end
end
