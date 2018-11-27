class EducatorMultifactorConfig < ApplicationRecord
  belongs_to :educator

  validates :rotp_secret, presence: true, uniqueness: true
  validates :educator, presence: true, uniqueness: true
  validates :sms_number, allow_nil: true, uniqueness: true, format: {
    with: /\A\+1\d{10}\z/
  }

  def self.new_rotp_secret
    ROTP::Base32.random_base32
  end
end
