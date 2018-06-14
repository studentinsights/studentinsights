class StudentPhoto < ActiveRecord::Base
  belongs_to :student

  validates :student, presence: true
  validates :file_digest, presence: true
  validates :s3_filename, presence: true
  validates :file_size, presence: true  # Size of the file in bytes.
end
