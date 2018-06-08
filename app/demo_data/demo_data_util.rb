class DemoDataUtil
  FIVE_YEARS_OF_SECONDS = 157766400

  def self.random_time(options = {})
    time_now = options[:time_now] || DateTime.now
    seconds_back = options[:seconds_back] || FIVE_YEARS_OF_SECONDS
    Time.at(time_now.to_i - (rand * seconds_back))
  end

  # Given a map of integers or ranges to weights, e.g
  #
  #     d = {
  #      0 => 0.83,
  #      1 => 0.10,
  #      (2..3) => 0.07,
  #    }
  #
  # Randomly chooses an integer in a correctly weighted way.
  # Range keys mean that we sample uniformly from the range.
  def self.sample_from_distribution(distribution)
    r = Random::rand(1.0)
    distribution.each {|k, weight|
      if r < weight
        return (if k.is_a?(Range) then k.to_a.sample else k end)
      else
        r -= weight
      end
    }
  end
end
