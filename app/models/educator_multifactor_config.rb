class EducatorMultifactorConfig < ApplicationRecord
  belongs_to :educator

  validates :rotp_secret, presence: true, uniqueness: true
  validates :educator, presence: true, uniqueness: true
  validates :sms_number, uniqueness: true, format: {
    with: /\A\+1\d{10}\z/
  }
end
