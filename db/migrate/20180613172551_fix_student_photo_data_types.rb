class FixStudentPhotoDataTypes < ActiveRecord::Migration[5.1]
  def change
    change_column :student_photos, :file_digest, :string
    change_column :student_photos, :s3_filename, :string
  end
end
