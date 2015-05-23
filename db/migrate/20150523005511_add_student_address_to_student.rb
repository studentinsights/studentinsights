class AddStudentAddressToStudent < ActiveRecord::Migration
  def change
    add_column :students, :student_address, :string
  end
end
