# There are security measures for logins that make some feature specs
# slow.  These security measure are enabled by default in development
# and in all tests, but this allows particular specs to opt-out of these
# to speed up testing (assuming these are tested in other specs).
class LoginTests
  def self.failed_login_message
    'Invalid login, password, or code.'
  end

  def self.before_set_login_timing!(milliseconds)
    @store_CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS = ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS']
    ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = milliseconds.to_s
  end

  def self.after_reset_loging_timing!
    ENV['CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS'] = @store_CONSISTENT_TIMING_FOR_LOGIN_IN_MILLISECONDS
  end

  def self.before_disable_consistent_timing!
    @store_UNSAFE_LDAP_AUTHENTICATABLE_TINY_TIMING = ENV['UNSAFE_LDAP_AUTHENTICATABLE_TINY_TIMING']
    ENV['UNSAFE_LDAP_AUTHENTICATABLE_TINY_TIMING'] = 'true'
  end

  def self.after_reenable_consistent_timing!
    ENV['UNSAFE_LDAP_AUTHENTICATABLE_TINY_TIMING'] = @store_UNSAFE_LDAP_AUTHENTICATABLE_TINY_TIMING
  end

  def self.reset_rack_attack!
    Rack::Attack.cache.store.clear
  end
end
