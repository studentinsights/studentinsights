# typed: true
class AddDateOfBirthToStudents < ActiveRecord::Migration[4.2]
  def change
    add_column :students, :date_of_birth, :datetime
  end
end
