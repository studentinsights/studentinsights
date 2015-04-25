module FakeStarResult

  # Fake data for demo roster


  def self.data
    {
      math_percentile_rank: rand(10..99), 
      reading_percentile_rank: rand(10..99), 
      instructional_reading_level: rand(1..6)
    }
  end
  
end