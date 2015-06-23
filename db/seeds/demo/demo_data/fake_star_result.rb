module FakeStarResult

  def self.data
    {
      date_taken: DateTime.new(rand(2010..2015), rand(1..12), rand(1..28)),
      math_percentile_rank: rand(10..99),
      reading_percentile_rank: rand(10..99),
      instructional_reading_level: rand(4..5)
    }
  end

end
