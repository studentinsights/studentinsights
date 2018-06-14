class AddStudentPhotoTable < ActiveRecord::Migration[5.1]
  def change
    create_table :student_photos do |t|
      t.belongs_to :student, index: true, foreign_key: true
      t.integer :file_digest
      t.integer :file_size
      t.integer :s3_filename
      t.timestamps
    end
  end
end
