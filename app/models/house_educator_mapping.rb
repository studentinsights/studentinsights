# Stores a mapping from the Student `house` field to an `educator` record
# indicating the educator belongs to that house.
class HouseEducatorMapping < ApplicationRecord
  belongs_to :educator

  validates :educator, presence: true
  validates :house_field_text, presence: true, uniqueness: true
  validate :validate_downcase_house_field_text

  def self.has_mapping?(educator_id, house_text)
    HouseEducatorMapping.find_by({
      educator_id: educator_id,
      house_field_text: house_text.downcase
    }).present?
  end

  private
  def validate_downcase_house_field_text
    if house_field_text.try(:downcase) != house_field_text
      errors.add(:house_field_text, 'must be lowercase')
    end
  end
end
