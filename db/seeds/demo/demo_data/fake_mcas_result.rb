class FakeMcasResultGenerator
  def initialize
    @dates = (2010..2015).to_a.shuffle
  end

  def next
    {
      date_taken: DateTime.new(@dates.pop, 5, 15),
      ela_scaled: rand(200..280),
      ela_performance: ["W", "NI", "P", "A", nil].sample,
      ela_growth: rand(100),
      math_scaled: rand(200..280),
      math_performance: ["W", "NI", "P", "A", nil].sample,
      math_growth: rand(100)
    }
  end
end
