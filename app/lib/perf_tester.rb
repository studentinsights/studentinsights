class PerfTester
  def initialize(options = {})
    @options = options
  end

  # querying and serializing data for absence dashboard at a particular school
  def absences_dashboard(percentage, options = {})
    school_id = options[:school_id] || School.all.first.id
    school = School.find(school_id)
    time_now = Time.at(1536589824)
    result = new_perf_test.simple(percentage, options) do |educator|
      queries = DashboardQueries.new(educator, time_now: time_now)
      queries.absence_dashboard_data(school)
    end
    new_perf_test.results_for_spec(result)
  end

  def levels_shs(percentage, options = {})
    time_now = options.fetch(:time_now, Time.at(1529067553))
    school_id = 9
    result = new_perf_test.simple(percentage, options) do |educator|
      levels = SomervilleHighLevels.new
      levels.students_with_levels_json(educator, [school_id], time_now)
    end
    new_perf_test.results_for_spec(result)
  end

  # May be used in critical path authorization code (see #authorized).
  def labels(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      educator.labels
    end
    new_perf_test.results_for_spec(result)
  end

  # Critical path authorization code (may call #labels).
  def authorized(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      Authorizer.new(educator).authorized { Student.active }
    end
    new_perf_test.results_for_spec(result)
  end

  def navbar_links(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      PathsForEducator.new(educator).navbar_links
    end
    new_perf_test.results_for_spec(result)
  end

  def authorized_homerooms(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      Authorizer.new(educator).homerooms
    end
    new_perf_test.results_for_spec(result)
  end

  def authorized_homerooms_DEPRECATED(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      Authorizer.new(educator).allowed_homerooms_DEPRECATED(acknowledge_deprecation: true)
    end
    new_perf_test.results_for_spec(result)
  end

  # See educators_controller#my_students_json
  def my_students(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
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
    new_perf_test.results_for_spec(result)
  end

  # See ClassListQueries.  This was driven by the view in admin/authorization, running this
  # across all educators.
  def is_relevant_for_educator?(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      ClassListQueries.new(educator).is_relevant_for_educator?
    end
    new_perf_test.results_for_spec(result)
  end

  # For testing the high absences insight
  def high_absences(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      time_now = options[:time_now] || Time.at(1522779136)
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(educator)
      insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
    end
    new_perf_test.results_for_spec(result)
  end

  def low_grades(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      time_now = options[:time_now] || Time.at(1522779136)
      time_threshold = time_now - 45.days
      grade_threshold = 69
      insight = InsightStudentsWithLowGrades.new(educator)
      insight.students_with_low_grades_json(time_now, time_threshold, grade_threshold)
    end
    new_perf_test.results_for_spec(result)
  end

  # Part of Section controller, influenced heavily by Authorizer.
  def section_authorization_pattern(percentage, options = {})
    result = new_perf_test.simple(percentage, options) do |educator|
      authorizer = Authorizer.new(educator)
      section = educator.sections.sample
      if section.nil?
        [[], []]
      else
        section_students = authorizer.authorized { section.students.active }
        authorized_sections = authorizer.authorized { Section.includes(:course).all }
        [section_students, authorized_sections]
      end
    end
    new_perf_test.results_for_spec(result)
  end

  # Usage for testing the feed (may call #authorized)
  def feed(percentage, options = {})
    perf_test = new_perf_test()
    timer = perf_test.run_with_tags(percentage, options) do |t, educator|
      time_now = options[:time_now] || Time.at(1521552855)
      limit = options[:limit] || 10
      students = t.measure('students') do
        Feed.students_for_feed(educator)
      end
      feed = Feed.new(students)
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
      student_voice_cards = t.measure('student_voice_cards') do
        feed.student_voice_cards(time_now)
      end
      t.measure('feed_cards') do
        feed.merge_sort_and_limit_cards([
          event_note_cards,
          birthday_cards,
          incident_cards,
          student_voice_cards
        ], limit)
      end
    end
    perf_test.print_timer_and_report timer
    timer
    perf_test.results_for_spec(result)
  end

  private
  def new_perf_test()
    PerfTest.new(@options)
  end
end
