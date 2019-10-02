# For measuring performance of different methods across
# a sample of Educators.  See `PerfTester` for usage.
#
# Example usage:
#
#   puts new_perf_test.simple(0.05) do |educator|
#     do_expensive_thing_for_educator(educator)
#   end;nil
#
class PerfTest
  def initialize(options = {})
    @log = options.fetch(:log, STDOUT)
  end

  # Simplest usage.  Block yields an educator.
  def simple(percentage, options = {}, &block)
    timer = self.run_with_tags(percentage, options) do |t, educator|
      block.yield(educator)
    end
    print_timer_and_report(timer)
    timer
  end

  def print_timer_and_report(timer)
    log timer.report
    reporter = PerfTest::Reporter.new(log: @log)
    log reporter.report(timer.report.group_by {|tuple| tuple[0] })
    nil
  end

  # Generic perftest usage:
  # timer = perf_test.run_with_tags(0.10) do |t, educator|
  #   t.measure('whatever') { do_something_for(educator) }
  #   t.measure('foo') { do_something_else_for(educator) }
  # end;nil
  # log timer.report
  def run_with_tags(percentage, options = {}, &block)
    timer = Timer.new(log: @log)

    log
    log
    log 'Getting test set...'
    educator_ids = test_educator_ids(percentage, options)
    log "Test set includes #{educator_ids.size} educators: [#{educator_ids.sort.join(',')}]"
    log 'Done.'
    log
    log
    log 'Starting test run...'
    run_for_all_educators(timer, educator_ids, &block)
    log 'Done.'
    log
    log
    timer
  end

  private
  def test_educator_ids(percent, options = {})
    seed = options[:seed] || 42
    fixed_educator_ids = options[:fixed_educator_ids] || []
    all_educator_ids = Educator.active.select(:id).map(&:id)
    sample_size = percent * all_educator_ids.size
    sample_educator_ids = all_educator_ids.sample(sample_size, random: Random.new(seed))
    (sample_educator_ids + fixed_educator_ids).uniq
  end
  
  def reset!
    ActiveRecord::Base.connection.query_cache.clear
  end

  def run_for_all_educators(t, educator_ids, &block)
    educator_ids.each do |educator_id|
      reset!
      log
      log "Starting for educator: #{educator_id}..."
      educator = Educator.find(educator_id)
      t.measure('all_for_educator') do
        block.yield(t, educator)
      end
    end
  end

  def log(msg = '')
    @log.puts msg
  end

  def debug!
    # This is dangerous, as it can result in logging sensitive information.
    # Use with caution, and verify the impact locally first.
    #
    # Rails.configuration.log_level = :debug
    # ActiveRecord::Base.logger = Logger.new(STDOUT)
  end


  # Helper class to print summary stats like p50, p95
  #
  # Usage:
  #
  #   Reporter.new.report({
  #     unoptimized: unoptimized_timer.report,
  #     optimized: optimized_timer.report
  #   })
  #
  # or json = JSON.parse(IO.read('runs.json'));nil
  # Reporter.new.report(json)
  class Reporter
    def initialize(options = {})
      @log = options.fetch(:log, STDOUT)
    end

    def report(timer_reports_map)
      timer_reports_map.each do |report_key, tuples|
        log
        log "#{report_key.upcase}, sample size: #{tuples.size}"
        tuples.group_by {|t| t[0]}.each do |key, ts|
          values = ts.map {|t| t[1] }
          p50 = percentile(values, 0.50).round
          p95 = percentile(values, 0.95).round
          log "  #{key.ljust(25)}\tmedian: #{p50}ms\t\tp95: #{p95}ms"
        end
      end
      nil
    end

    private
    # copied from https://stackoverflow.com/questions/11784843/calculate-95th-percentile-in-ruby
    def percentile(values, percentile)
      values_sorted = values.sort
      k = (percentile*(values_sorted.length-1)+1).floor - 1
      f = (percentile*(values_sorted.length-1)+1).modulo(1)
      return values_sorted[k] + (f * (values_sorted[k+1] - values_sorted[k]))
    end

    private
    def log(msg = '')
      @log.puts msg
    end
  end


  # Helper class to hold timing data
  class Timer
    def initialize(options = {})
      @log = options.fetch(:log, STDOUT)
      @measurements = []
    end

    # not attr_reader so it doesn't log by default (values are large!)
    def measurements
      @measurements
    end

    def measure(tag)
      value = nil
      timing = Benchmark.measure { value = yield }
      log tag + timing.to_s
      @measurements << {tag: tag, timing: timing, value: value}
      value
    end

    def report
      tuples = @measurements.map do |measurement|
        ms = (measurement[:timing].real * 1000).round
        [measurement[:tag], ms]
      end
      tuples.sort_by {|t| [t[0], t[1]] }
    end

    private
    def log(msg = '')
      @log.puts msg
    end
  end
end
