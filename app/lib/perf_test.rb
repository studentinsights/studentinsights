class PerfTest
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
    def report(timer_reports_map)
      timer_reports_map.each do |report_key, tuples|
        puts
        puts "#{report_key.upcase}, sample size: #{tuples.size}"
        tuples.group_by {|t| t[0]}.each do |key, ts|
          values = ts.map {|t| t[1] }
          p50 = percentile(values, 0.50).round
          p95 = percentile(values, 0.95).round
          puts "  #{key.ljust(25)}\tmedian: #{p50}ms\t\tp95: #{p95}ms"
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
  end

  # Helper class to hold timing data
  class Timer
    def initialize()
      @measurements = []
    end

    # not attr_reader so it doesn't puts by default (values are large!)
    def measurements
      @measurements
    end

    def measure(tag)
      value = nil
      timing = Benchmark.measure { value = yield }
      puts tag + timing.to_s
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
  end

  # Usage for testing the feed
  def self.feed(percentage, options = {})
    timer = PerfTest.new.run(0.1) do |t, educator|
      time_now = options[:time_now] || Time.at(1521552855)
      limit = options[:limit] || 10
      feed = Feed.new(educator)
      event_note_cards = t.measure('event_note_cards') do
        feed.event_note_cards(time_now, limit)
      end
      incident_cards = t.measure('incident_cards') do
        feed.incident_cards(time_now, limit)
      end
      birthday_cards = t.measure('birthday_cards') do
        feed.birthday_cards(time_now, limit, {
          limit: 3,
          days_back: 3,
          days_ahead: 0
        })
      end
      t.measure('feed_cards') do
        feed.merge_sort_and_limit_cards([
          event_note_cards,
          birthday_cards,
          incident_cards
        ], limit)
      end
    end
    pp timer.report
    timer
  end

  # Generic perftest usage:
  # timer = perf_test.run(0.10) do |t, educator|
  #   t.measure('whatever') { do_something_for(educator) }
  #   t.measure('foo') { do_something_else_for(educator) }
  # end;nil
  # pp timer.report
  def run(percentage, &block)
    timer = Timer.new

    puts
    puts
    puts 'Getting test set...'
    educator_ids = test_educator_ids(percentage)
    puts "Test set includes #{educator_ids.size} educators: [#{educator_ids.sort.join(',')}]"
    puts 'Done.'
    puts
    puts
    puts 'Starting test run...'
    run_for_all_educators(timer, educator_ids, &block)
    puts 'Done.'
    puts
    puts
    timer
  end

  def test_educator_ids(percent, options = {})
    seed = options[:seed] || 42
    fixed_educator_ids = options[:fixed_educator_ids] || []
    all_educator_ids = Educator.all.select(:id).map(&:id)
    sample_size = percent * all_educator_ids.size
    sample_educator_ids = all_educator_ids.sample(sample_size, random: Random.new(seed))
    (sample_educator_ids + fixed_educator_ids).uniq
  end

  private
  def debug!
    Rails.configuration.log_level = :debug
    ActiveRecord::Base.logger = Logger.new(STDOUT)
  end

  def reset!
    ActiveRecord::Base.connection.query_cache.clear
  end

  def run_for_all_educators(t, educator_ids, &block)
    educator_ids.each do |educator_id|
      reset!
      puts
      puts "Starting for educator: #{educator_id}..."
      educator = Educator.find(educator_id)
      t.measure('all_for_educator') do
        block.yield(t, educator)
      end
    end
  end
end
