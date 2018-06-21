class PerfTest
  def self.tiering_detailed(percentage, options = {})
    timer = PerfTest.new.run_with_tags(percentage, options) do |t, educator|
      time_now = Time.at(1529067553)
      school_ids = [9]
      tiers = ExperimentalSomervilleHighTiers.new(educator)
      authorizer = Authorizer.new(educator)

      students = t.measure('students') do
        authorizer.authorized do
          Student.active
            .where(school_id: school_ids)
            .includes(student_section_assignments: [section: :course])
            .includes(:event_notes)
            .to_a # because of AuthorizedDispatcher#filter_relation
        end
      end

      students_json = t.measure('students_json') do
        students.as_json({
          only: [:id, :first_name, :last_name, :grade, :house, :sped_placement, :program_assigned],
          include: {
            student_section_assignments: {
              :only => [:id, :grade_letter, :grade_numeric],
              :include => {
                :section => {
                  :only => [:id, :section_number],
                  :methods => [:course_description]
                }
              }
            }
          }
        })
      end

      tiers_map = {}
      t.measure('tiers_json') do
        students.each do |student|
          tiers_map[student.id] = tiers.send(:tier, student, time_now: time_now).as_json
        end
      end

      notes_map = {}
      t.measure('notes_json') do
        raw_rows = EventNote
          .where(is_restricted: false)
          .select('student_id, event_note_type_id, max(recorded_at) as most_recent_recorded_at')
          .group(:student_id, :event_note_type_id)
        students.each do |student|
          notes_map[student.id] = {
            last_sst_note: serialize_note(raw_rows.find {|r| 300 == r.event_note_type_id}),
            last_experience_note:  serialize_note(raw_rows.find {|r| [305, 306].include?(r.event_note_type_id)})
          }
        end
      end

      t.measure('merge') do
        students_json.map do |student_json|
          student_id = student_json['id']
          student_json.merge({
            tier: tiers_map[student_id],
            notes: notes_map[student_id]
          })
        end
      end
    end
    pp timer.report
    timer
  end

  def self.tiering(percentage, options = {})
    PerfTest.new.simple(percentage, options) do |educator|
      time_now = Time.at(1529067553)
      school_id = 9
      tiers = ExperimentalSomervilleHighTiers.new(educator)
      tiers.students_with_tiering_json([school_id], time_now)
    end
  end

  # Critical path authorization code
  def self.authorized(percentage, options = {})
    PerfTest.new.simple(percentage, options) do |educator|
      Authorizer.new(educator).authorized { Student.active }
    end
  end

  # See educators_controller#my_students_json
  def self.my_students(percentage, options = {})
    PerfTest.new.simple(percentage, options) do |educator|
      students = Authorizer.new(educator).authorized { Student.active.includes(:school).to_a }
      students.as_json({
        only: [:id, :first_name, :last_name, :house, :counselor, :grade],
        include: {
          school: {
            only: [:id, :name]
          }
        }
      })
    end
  end

  # See ClassListQueries.  This was driven by the view in admin/authorization, running this
  # across all educators.
  def self.is_relevant_for_educator?(percentage, options = {})
    PerfTest.new.simple(percentage, options) do |educator|
      ClassListQueries.new(educator).is_relevant_for_educator?
    end
  end

  # For testing the high absences insight
  def self.high_absences(percentage, options = {})
    PerfTest.new.simple(percentage, options) do |educator|
      time_now = options[:time_now] || Time.at(1522779136)
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(educator)
      insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
    end
  end

  # Usage for testing the feed
  def self.feed(percentage, options = {})
    timer = PerfTest.new.run_with_tags(percentage, options) do |t, educator|
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

  # Simplest usage.  Block yields an educator.
  def simple(percentage, options = {}, &block)
    timer = PerfTest.new.run_with_tags(percentage, options) do |t, educator|
      block.yield(educator)
    end
    pp timer.report
    pp PerfTest::Reporter.new.report(timer.report.group_by {|tuple| tuple[0] })
    timer
  end

  # Generic perftest usage:
  # timer = perf_test.run_with_tags(0.10) do |t, educator|
  #   t.measure('whatever') { do_something_for(educator) }
  #   t.measure('foo') { do_something_else_for(educator) }
  # end;nil
  # pp timer.report
  def run_with_tags(percentage, options = {}, &block)
    timer = Timer.new

    puts
    puts
    puts 'Getting test set...'
    educator_ids = test_educator_ids(percentage, options)
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
