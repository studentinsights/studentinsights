class AddEnrollmentStatusToStudents < ActiveRecord::Migration
  def change
    add_column :students, :enrollment_status, :string
  end
end
