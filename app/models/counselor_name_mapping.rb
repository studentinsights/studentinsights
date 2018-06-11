# Stores a mapping from the Student `counselor` field to an `educator` record.
class CounselorNameMapping < ApplicationRecord
  belongs_to :educator

  validates :educator, presence: true
  validates :counselor_field_text, presence: true, uniqueness: true
end
