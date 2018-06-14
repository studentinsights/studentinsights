class AddStudentSpedLiaison < ActiveRecord::Migration[5.1]
  def change
    add_column :students, :sped_liaison, :text
  end
end
