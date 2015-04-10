class User < ActiveRecord::Base
  devise :two_factor_authenticatable,
         otp_secret_encryption_key: Rails.env.test? ? 'SECRET' : ENV['TWO_FACTOR_ENCRYPTION_KEY'],
         otp_allowed_drift: 60

  devise :rememberable, :trackable, :validatable, :timeoutable

  before_create :initialize_otp_secret

  def initialize_otp_secret
    self.otp_secret = User.generate_otp_secret
  end

end