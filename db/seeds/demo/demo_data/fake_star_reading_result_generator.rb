class FakeStarReadingResultGenerator
  def initialize
    @test_date = DateTime.new(2010, 9, 1)
    @reading_percentile = rand(10..99)
  end

  def next
    @reading_percentile += rand(-15..15)
    @reading_percentile = [0, @reading_percentile, 100].sort[1]
    @test_date += rand(30..60)  # days

    return {
      assessment_family_id: AssessmentFamily.star.id,
      assessment_subject_id: AssessmentSubject.reading.id,
      date_taken: @test_date,
      percentile_rank: @reading_percentile,
    }
  end
end
