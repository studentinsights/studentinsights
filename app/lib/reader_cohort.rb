class ReaderCohort
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
  end

  def reader_cohort_json(benchmark_assessment_key, school_years)
    comparison_students = full_cohort_skipping_authorization()
    
    cells = {}
    school_years.each do |benchmark_school_year|
      [:fall, :winter, :spring].each do |benchmark_period_key|
        value = extract_values([@student], benchmark_assessment_key, benchmark_school_year, benchmark_period_key).try(:first)
        when_key = [benchmark_school_year, benchmark_period_key].join('-')
        if value.present?
          cells[when_key] = cell_json(value, comparison_students, benchmark_assessment_key, benchmark_school_year, benchmark_period_key)
        end
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
  def cell_json(value, comparison_students, benchmark_assessment_key, benchmark_school_year, benchmark_period_key)
    comparison_values = extract_values(comparison_students, benchmark_assessment_key, benchmark_school_year, benchmark_period_key)
    stats_json = stats(comparison_values, value)

    {
      value: value,
      stats: stats_json
    }
  end

  # This can leak information to the educator about students in the cohort that
  # they are not authorized to view.  In practice, they already have access to
  # more detailed reading information about a wider cohort in the Google Sheets
  # used to enter this information at the school level, so the information leakage
  # here is much less and not a significant concern.
  def full_cohort_skipping_authorization
    Student.active.where(grade: @student.grade).where.not(id: @student.id)
  end

  # Can be optimized
  def extract_values(students, benchmark_assessment_key, benchmark_school_year, benchmark_period_key)
    most_recent_data_points = students.map do |student|
      student.reading_benchmark_data_points.where({
        benchmark_assessment_key: benchmark_assessment_key.to_s,
        benchmark_school_year: benchmark_school_year,
        benchmark_period_key: benchmark_period_key
      }).order(updated_at: :desc).limit(1).first
    end
    int_values = most_recent_data_points.compact.map do |d|
      ComparableDataPoint.new(d).extract
    end
    int_values.compact
  end

  # returns a map including percentile and rank
  def stats(values, value)
    n_lower = values.select {|v| v < value }.size
    equal = values.select {|v| v == value }.size
    n_higher = values.size - (n_lower + equal)
    percentile = (n_lower / values.size.to_f) + (equal / values.size.to_f / 2)
    {
      p: (percentile * 100).to_i,
      n_lower: n_lower,
      n_higher: n_higher
    }
  end

  # Includes comparator for using < etc.
  class ComparableDataPoint
    include Comparable
    def initialize(reading_benchmark_data_point)
      @data_point = reading_benchmark_data_point
    end

    def type
      map.fetch(@data_point.benchmark_assessment_key, :unknown)
    end

    def extract
      case type
        when :int then @data_point.json['value'].try(:to_i)
        when :text then @data_point.json['value']
        when :f_and_p then @data_point.json['value']
        else @data_point.json['value']
      end
    end

    # implement Comparable
    def <=>(other)
      a = extract()
      b = ComparableDataPoint.new(other).extract
      
      return nil if type != b.type # can't compare
      case type
        when :int then a <=> b
        when :text then a <=> b
        when :f_and_p then f_and_p_ordering_map.fetch(a, 0) <=> f_and_p_ordering_map.fetch(b, 0)
        else a <=> b
      end
    end

    private
    def f_and_p_ordering_map
      {
        'NR' => 50,
        'AA' => 80,
        'A' => 110,
        'B' => 120,
        'C' => 130,
        'D' => 150,
        'E' => 160,
        'F' => 170,
        'G' => 180,
        'H' => 190,
        'I' => 200,
        'J' => 210,
        'K' => 220,
        'L' => 230,
        'M' => 240,
        'N' => 250,
        'O' => 260,
        'P' => 270,
        'Q' => 280,
        'R' => 290,
        'S' => 300,
        'T' => 310,
        'U' => 320,
        'V' => 330,
        'W' => 340,
        'X' => 350,
        'Y' => 360,
        'Z' => 370 # Z+ is also a special case per F&P docs, but ignore it for now since folks use + a lot of different places
      }
    end

    def map
      {
        'dibels_fsf' => :int,
        'dibels_lnf' => :int,
        'dibels_psf' => :int,
        'dibels_nwf_cls' => :int,
        'dibels_nwf_wwr' => :int,
        'dibels_dorf_wpm' => :int,
        'dibels_dorf_errors' => :int,
        'dibels_dorf_acc' => :int,
        'f_and_p_english' => :f_and_p,
        'f_and_p_spanish' => :f_and_p,
        'instructional_needs' => :text
      }
    end
  end
end
