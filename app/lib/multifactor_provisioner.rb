# typed: true
# Usage
# > sofia = Educator.find_by_login_name('sofia')
# > MultifactorProvisioner.new.enable_and_provision!
# (prints QR code on console)
class MultifactorProvisioner
  # end-to-end
  def enable_and_provision!(educator)
    enable_two_factor!(educator)
    totp = peek_totp(educator)
    puts provision_from_totp(totp)
    nil
  end

  def enable_two_factor!(educator)
    config = EducatorMultifactorConfig.create!({
      educator: educator,
      rotp_secret: EducatorMultifactorConfig.new_rotp_secret,
      last_verification_at: nil
    })
    config.rotp_secret
  end

  def peek_totp(educator)
    multifactor_authenticator = MultifactorAuthenticator.new(educator)
    multifactor_authenticator.send(:create_totp!)
  end

  def provision_from_totp(totp)
    name_within_authenticator_app = "Student Insights #{PerDistrict.new.district_name}"
    url = totp.provisioning_uri(name_within_authenticator_app)
    RQRCode::QRCode.new(url).as_ansi({
      light: "\033[47m",
      dark: "\033[40m",
      fill_character: '  ',
      quiet_zone_size: 4
    })
  end
end
