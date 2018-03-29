class EnvironmentVariable
  def self.is_true(string_key)
    value = ENV[string_key]
    return false if value == nil
    return false unless value.downcase == 'true'
    true
  end

  def self.value(string_key)
    ENV[string_key]
  end
end
