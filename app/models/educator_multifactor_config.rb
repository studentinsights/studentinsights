class EducatorMultifactorConfig < ApplicationRecord
  belongs_to :educator

  validates :educator, presence: true, uniqueness: true
  validates :sms_number, allow_nil: true, uniqueness: true, format: {
    with: /\A\+1\d{10}\z/
  }
  validates :rotp_secret, presence: true, uniqueness: true
  validate :validate_rotp_secret

  def self.new_rotp_secret
    ROTP::Base32.random_base32
  end

  private
  # This has to be valid base32, so to validate that instantiate one and see if it raises.
  # Check this for a time in the past, so that it can't leak a code.
  def validate_rotp_secret
    return if errors.present?
    begin
      totp = ROTP::TOTP.new(self.rotp_secret)
      totp.at(Time.at(1474590600))
    rescue ROTP::Base32::Base32Error => _
      errors.add(:rotp_secret, 'not valid base32')
    end
  end
end
