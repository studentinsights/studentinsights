class AddStudentPhotoToStudent < ActiveRecord::Migration[5.1]
  def change
    add_column :students, :student_photo_id, :integer
  end
end
