class AddNonNullPhotos < ActiveRecord::Migration[5.2]
  def change
    change_column :student_photos, :file_digest, :string, null: false
    change_column :student_photos, :file_size, :integer, null: false
    change_column :student_photos, :s3_filename, :string, null: false
  end
end
