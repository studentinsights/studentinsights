class ReaderCohort
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
  end

  def reader_cohort_json(benchmark_assessment_key, school_years, options = {})
    comparison_students = options.fetch(:comparison_students, full_cohort_skipping_authorization())

    cells = {}
    school_years.each do |benchmark_school_year|
      [:fall, :winter, :spring].each do |benchmark_period_key|
        json = cell_json(*[
          comparison_students,
          benchmark_assessment_key,
          benchmark_school_year,
          benchmark_period_key
        ])
        next if json.nil?
        when_key = [benchmark_school_year, benchmark_period_key].join('-')
        cells[when_key] = json
      end
    end

    {
      time_now: @time_now,
      student_id: @student.id,
      benchmark_assessment_key: benchmark_assessment_key,
      school_years: school_years,
      comparison_students: comparison_students.size,
      cells: cells
    }
  end

  private
  # This can leak information to the educator about students in the cohort that
  # they are not authorized to view.  In practice, they already have access to
  # more detailed reading information about a wider cohort in the Google Sheets
  # used to enter this information at the school level, so the information leakage
  # here is much less and not a significant concern.
  #
  # The intention here in using school is to encourage problem solving, and an
  # actionable reference for teacher or school-based specialist, coach or AP.
  def full_cohort_skipping_authorization
    return [] if @student.school_id.nil? || @student.grade.nil?
    Student.active
      .where(school_id: @student.school_id)
      .where(grade: @student.grade)
      .where.not(id: @student.id)
  end

  # Optimized to one query
  def most_recent_data_points(students, benchmark_assessment_key, benchmark_school_year, benchmark_period_key)
    all_data_points = ReadingBenchmarkDataPoint.where({
      student_id: students.map(&:id),
      benchmark_assessment_key: benchmark_assessment_key.to_s,
      benchmark_school_year: benchmark_school_year,
      benchmark_period_key: benchmark_period_key
    })
    grouped_data_points = all_data_points.group_by(&:student_id)
    grouped_data_points.map do |student_id, data_points|
      data_points.sort_by(&:updated_at).last
    end
  end

  # Query for that cell's data, compute stats, and return plain JSON
  def cell_json(comparison_students, benchmark_assessment_key, benchmark_school_year, benchmark_period_key)
    data_point = most_recent_data_points([@student], benchmark_assessment_key, benchmark_school_year, benchmark_period_key).try(:first)
    return nil if data_point.nil?

    comparison_data_points = most_recent_data_points(comparison_students, benchmark_assessment_key, benchmark_school_year, benchmark_period_key)
    stats_json = stats(data_point, comparison_data_points)
    {
      value: data_json.json['value'],
      stats: stats_json
    }
  end

  # returns a map including percentile and rank
  def stats(data_point, comparison_data_points)
    # Use ComparableReadingBenchmarkDataPoint to be able
    # to interpret and directly compare and sort different types
    # of data (eg, text describing F&P levels).
    anchor_d = ComparableReadingBenchmarkDataPoint.new(data_point)
    other_ds = comparison_data_points.map {|d| ComparableReadingBenchmarkDataPoint.new(d) }

    # Do the math
    n_lower = other_ds.select {|v| v < anchor_d }.size
    equal = other_ds.select {|v| v == anchor_d }.size
    n_higher = other_ds.size - (n_lower + equal)
    percentile = (n_lower / other_ds.size.to_f) + (equal / other_ds.size.to_f / 2)
    {
      p: (percentile * 100).to_i,
      n_lower: n_lower,
      n_higher: n_higher
    }
  end
end
