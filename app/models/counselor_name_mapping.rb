# Stores a mapping from the Student `counselor` field to an `educator` record.
class CounselorNameMapping < ApplicationRecord
  belongs_to :educator

  validates :educator, presence: true
  validates :counselor_field_text, presence: true, uniqueness: true
  validate :validate_downcase_counselor_field_text

  def self.has_mapping?(educator_id, counselor_text)
    CounselorNameMapping.find_by({
      educator_id: educator_id,
      counselor_field_text: counselor_text.downcase
    }).present?
  end

  private
  def validate_downcase_counselor_field_text
    if counselor_field_text.downcase != counselor_field_text
      errors.add(:counselor_field_text, 'must be lowercase')
    end
  end
end
