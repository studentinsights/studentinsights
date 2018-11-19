class ConsistentTiming
  # Allow running a block of some execution time, and
  # clamping it to take at least N milliseconds regardless of how
  # fast it exits.
  def enforce_timing(desired_milliseconds, &block)
    return block.call if disabled_for_test?

    return_value, actual_milliseconds = measure_timing_only(&block)
    sleep((desired_milliseconds - actual_milliseconds)/1000.0)
    return_value
  end

  def measure_timing_only(&block)
    start_milliseconds = read_monotonic_milliseconds()
    return_value = block.call()
    end_milliseconds = read_monotonic_milliseconds()

    [return_value, end_milliseconds - start_milliseconds]
  end

  private
  def read_monotonic_milliseconds
    Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
  end

  def disabled_for_test?
    Rails.env.test? && EnvironmentVariable.is_true('UNSAFE_LDAP_AUTHENTICATABLE_TINY_TIMING')
  end
end
