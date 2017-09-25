class DemoDataUtil
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
