class ConsistentTiming
  # Allow running a block of some execution time, and
  # clamping it to take at least N milliseconds regardless of how
  # fast it exits.  Noisy, see specs.
  def enforce_timing(desired_milliseconds, &block)
    return block.call if disabled_for_test?

    return_value, actual_milliseconds = measure_timing_only(&block)
    wait_for_milliseconds_or_alert(desired_milliseconds - actual_milliseconds)
    return_value
  end

  # This catches exceptions to enforce timing, and sends a Rollbar error for each one.
  def measure_timing_only(&block)
    start_milliseconds = read_monotonic_milliseconds()
    begin
      return_value = block.call()
    rescue => err
      Rollbar.error('ConsistentTiming#measure_timing_only caught an error', err)
      return_value = nil
    end
    end_milliseconds = read_monotonic_milliseconds()

    [return_value, end_milliseconds - start_milliseconds]
  end

  private
  def wait_for_milliseconds_or_alert(milliseconds_to_wait)
    return sleep(milliseconds_to_wait/1000.0) if milliseconds_to_wait > 0

    Rollbar.warn('ConsistentTiming#wait_for_milliseconds_or_alert was negative', {
      rollbar_safelist_milliseconds_to_wait: milliseconds_to_wait
    })
  end

  def read_monotonic_milliseconds
    Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
  end

  def disabled_for_test?
    Rails.env.test? && EnvironmentVariable.is_true('UNSAFE_DISABLE_CONSISTENT_TIMING')
  end
end
