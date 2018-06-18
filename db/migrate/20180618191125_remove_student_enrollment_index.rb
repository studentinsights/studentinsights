class RemoveStudentEnrollmentIndex < ActiveRecord::Migration[5.1]
  def change
    remove_index("students", name: "index_students_on_enrollment_status")
  end
end
