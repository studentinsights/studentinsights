class FakeStarMathResultGenerator
  def initialize
    @test_date = DateTime.new(2010, 9, 1)
    @math_percentile = rand(10..99)
    @reading_percentile = rand(10..99)
  end

  def next
    @math_percentile += rand(-15..15)
    @math_percentile = [0, @math_percentile, 100].sort[1]
    @test_date += rand(30..60)  # days

    return {
      assessment_family_id: AssessmentFamily.star.id,
      assessment_subject_id: AssessmentSubject.math.id,
      date_taken: @test_date,
      percentile_rank: @math_percentile,
      instructional_reading_level: rand(4..5)
    }
  end
end
