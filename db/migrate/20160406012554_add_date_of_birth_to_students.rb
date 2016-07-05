class AddDateOfBirthToStudents < ActiveRecord::Migration
  def change
    add_column :students, :date_of_birth, :datetime
  end
end
