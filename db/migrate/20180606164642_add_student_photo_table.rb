class AddStudentPhotoTable < ActiveRecord::Migration[5.1]
  def change
    create_table :student_photos do |t|
      t.string :student_id
      t.integer :file_digest
      t.integer :file_size
      t.integer :s3_filename
      t.timestamps
    end
  end
end
