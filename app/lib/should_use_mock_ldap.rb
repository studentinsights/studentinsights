class ShouldUseMockLDAP

  def check
    return false unless ::EnvironmentVariable.is_true('USE_MOCK_LDAP')
    return false unless ENV['MOCK_LDAP_PASSWORD'].present?
    return false if ENV['DISTRICT_LDAP_HOST'].present? || ENV['DISTRICT_LDAP_PORT'].present?
    return true if Rails.env.development? || Rails.env.test?
    return true if PerDistrict.new.district_key == 'demo'
    return false
  end

end
