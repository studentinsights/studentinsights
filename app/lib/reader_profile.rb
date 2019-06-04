class ReaderProfile
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
    @cards_limit = options.fetch(:cards_limit, 100)
  end

  def reader_profile_json
    benchmark_data_points = ReadingBenchmarkDataPoint.all.where(student_id: @student.id)
    feed_cards = Feed.new([@student]).all_cards(@time_now, @cards_limit)

    {
      current_school_year: SchoolYear.to_school_year(@time_now),
      feed_cards: feed_cards,
      benchmark_data_points: benchmark_data_points
    }
  end
end
