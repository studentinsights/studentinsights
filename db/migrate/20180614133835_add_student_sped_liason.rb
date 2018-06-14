class AddStudentSpedLiason < ActiveRecord::Migration[5.1]
  def change
    add_column :students, :sped_liason, :text
  end
end
