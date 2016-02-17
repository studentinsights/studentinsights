class FakeStarReadingResultGenerator

  def initialize(student)
    @test_date = DateTime.new(2010, 9, 1)
    @student = student
    @instructional_reading_level = @student.grade.to_f
    @reading_percentile = rand(10..99)
  end

  def star_reading_assessment_id
    @assessment_id ||= Assessment.find_by_family_and_subject('STAR', 'Reading').id
  end

  def next
    @reading_percentile += rand(-15..15)
    @reading_percentile = [0, @reading_percentile, 100].sort[1]
    @instructional_reading_level += rand(-1..1)
    @test_date += rand(30..60)  # days

    return {
      assessment_id: star_reading_assessment_id,
      date_taken: @test_date,
      percentile_rank: @reading_percentile,
      instructional_reading_level: @instructional_reading_level,
      student_id: @student.id
    }
  end
end
