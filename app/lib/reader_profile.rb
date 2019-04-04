class ReaderProfile
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
  end

  def reader_profile_json
    benchmark_data_points = JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2019-04-02-reading-kindergarten/imported.json'))
    # latest_mtss_notes = JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2019-04-02-reading-kindergarten/latest_mtss_notes.json'))
    profile = JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2019-04-02-reading-kindergarten/profile.json'))
    event_notes = profile['feed']['event_notes']

    # student_id = benchmark_data_points.sample(1).first['student_id']
    # student_id = 5738 7204
    student_id = 7204
    {
      student_id: student_id,
      grade: 'KF',
      current_school_year: SchoolYear.to_school_year(@time_now),
      event_notes: event_notes,
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
