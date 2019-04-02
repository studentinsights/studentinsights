class ReaderProfile
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
  end

  def reader_profile_json
    benchmark_data_points = JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2019-04-02-reading-kindergarten/imported.json'))
    
    # student_id = benchmark_data_points.sample(1).first['student_id']
    student_id = 5738
    {
      student_id: student_id,
      grade: 'KF',
      current_school_year: SchoolYear.to_school_year(@time_now),
      benchmark_data_points: benchmark_data_points.select {|d| d['student_id'] == student_id }.map do |d|
        {
          imported_by_educator_id: d['imported_by_educator_id'],
          benchmark_school_year: 2018,
          benchmark_period_key: d['assessment_period'],
          benchmark_assessment_key: d['assessment_key'],
          json: {
            data_point: d['data_point']
          }
        }
      end
    }
  end
end
