module FakeMcasResult

  def self.data
    {
      date_taken: DateTime.new(rand(2010..2015), rand(1..12), rand(1..28)),
      ela_scaled: rand(200..280),
      ela_performance: ["W", "NI", "P", "A", nil].sample,
      ela_growth: rand(100),
      math_scaled: rand(200..280),
      math_performance: ["W", "NI", "P", "A", nil].sample,
      math_growth: rand(100)
    }
  end

end
