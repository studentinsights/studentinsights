class FakeStarReadingResultGenerator

  def initialize(student)
    @test_date = DateTime.new(2010, 9, 1)
    @reading_percentile = rand(10..99)
    @student = student
  end

  def next
    @reading_percentile += rand(-15..15)
    @reading_percentile = [0, @reading_percentile, 100].sort[1]
    @test_date += rand(30..60)  # days

    return {
      assessment_id: Assessment.star.reading.last_or_missing.id,
      date_taken: @test_date,
      percentile_rank: @reading_percentile,
      student_id: @student.id
    }
  end
end
