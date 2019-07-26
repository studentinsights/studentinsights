# typed: true
class AddGenderToStudents < ActiveRecord::Migration[4.2]
  def change
    add_column :students, :gender, :string
  end
end
