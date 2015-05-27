module FakeMcasResult

  # Fake data for demo roster

  def self.data
    {
      ela_scaled: rand(200..280), 
      ela_performance: ["W", "NI", "P", "A", nil].sample, 
      ela_growth: rand(100), 
      math_scaled: rand(200..280), 
      math_performance: ["W", "NI", "P", "A", nil].sample, 
      math_growth: rand(100)
    }
  end

end