class ReaderProfile
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
    @cards_limit = options.fetch(:cards_limit, 100)
  end

  def reader_profile_json
    json_by_student_id = JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2019-04-02-reading-kindergarten/reader_profiles_by_student_id.json'))
    student_ids = json_by_student_id.keys
    # student_id = student_ids.sample
    # return json_by_student_id[student_id]
    # student_id = '5531' # 1st
    # student_id = '5684' # 1st
    # student_id = '5682' # 1st
    student_id = '3376' # 1st
    return json_by_student_id[student_id]

    benchmark_data_points = ReadingBenchmarkDataPoint.all.where(student_id: @student.id)
    feed_cards = Feed.new([@student]).all_cards(@time_now, @cards_limit)

    {
      current_school_year: SchoolYear.to_school_year(@time_now),
      feed_cards: feed_cards,
      benchmark_data_points: benchmark_data_points
    }
  end
end
