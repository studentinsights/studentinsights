# typed: true
class AddEnrollmentStatusToStudents < ActiveRecord::Migration[4.2]
  def change
    add_column :students, :enrollment_status, :string
  end
end
