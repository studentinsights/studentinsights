class EnvironmentVariable
  def is_true(string_key)
    value = ENV[string_key]
    return false if value == nil
    return false unless value.downcase == 'true'
  end

  def value(string_key)
    ENV[string_key]
  end
end