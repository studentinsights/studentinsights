class EducatorMultifactorConfig < ApplicationRecord
  APP_MODE = 'EducatorMultifactorConfig.APP'
  EMAIL_MODE = 'EducatorMultifactorConfig.EMAIL'
  SMS_MODE = 'EducatorMultifactorConfig.SMS'

  belongs_to :educator

  validates :educator, presence: true, uniqueness: true
  validates :sms_number, allow_nil: true, uniqueness: true, format: {
    with: /\A\+1\d{10}\z/
  }
  validates :rotp_secret, presence: true, uniqueness: true
  validate :validate_rotp_secret
  validate :validate_mode

  def self.new_rotp_secret
    ROTP::Base32.random_base32
  end

  # What mode are they set to?  Should we send a code via email, via SMS, or
  # do nothing because they have an authenticator app configured.
  # 
  # Defensively confirm the record is valid, saved, and unchanged or raise if not.
  def mode
    raise Exceptions::InvalidConfiguration if (!self.valid? || !self.persisted? || self.changed?)
    return SMS_MODE if sms_number.present?
    return EMAIL_MODE if via_email
    return APP_MODE
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

  # Ensure that records can't be set to both email and an SMS number.
  def validate_mode
    if via_email && sms_number.present?
      errors.add(:via_email, 'via_email cannot be set with sms_number')
      errors.add(:sms_number, 'sms_number cannot be set with via_email')
    end
  end
end
