class FakeStarResultGenerator
  def initialize
  	@test_date = DateTime.new(2010, 9, 1)
    @math_percentile = rand(10..99)
    @reading_percentile = rand(10..99)
  end

  def next
  	@math_percentile += rand(-15..15)
  	@reading_percentile += rand(-15..15)
  	@test_date += rand(30..60)  # days
    {
      date_taken: @test_date,
      math_percentile_rank: @math_percentile,
      reading_percentile_rank: @reading_percentile,
      instructional_reading_level: rand(4..5)
    }
  end
end
