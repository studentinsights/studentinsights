# Check for suspicious bits about the login, for warning.
class LoginChecker
  def initialize(educator, options = {})
    @educator = educator
    @time_now = options.fetch(:time_now, Time.now)
  end

  def warn_if_suspicious
    flags = infer_flags
    warn_about(flags)
    flags
  end

  private
  def infer_flags
    last_login_at = LoginActivity.last_login_at(@educator)

    flags = []
    flags << :first_login_month_after_creation if last_login_at.nil? && @educator.created_at < (@time_now - 30.days)
    flags << :first_login_after_year if last_login_at.present? && last_login_at < (@time_now - 1.year)
    flags.sort
  end

  def warn_about(flags)
    if flags.size > 0
      Rollbar.warn('LoginChecker#warn_if_suspicious', flags: flags)
    end
  end
end
