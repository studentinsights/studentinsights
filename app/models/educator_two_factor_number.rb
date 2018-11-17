class EducatorTwoFactorNumber < ApplicationRecord
  belongs_to :educator

  validates :educator, presence: true, uniqueness: true
  validates :two_factor_number, uniqueness: true, format: {
    with: /\A\+1\d{10}\z/
  }

  def self.for_educator_id(educator_id)
    EducatorTwoFactorNumber.order(updated_at: :desc).where({
      educator_id: educator_id
    }).first.try(:two_factor_number)
  end
end
