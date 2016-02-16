class FakeStarMathResultGenerator

  def initialize(student)
    @test_date = DateTime.new(2010, 9, 1)
    @math_percentile = rand(10..99)
    @student = student
  end

  def star_math_assessment_id
    @assessment_id ||= Assessment.find_by_family_and_subject('STAR', 'Math').id
  end

  def next
    @math_percentile += rand(-15..15)
    @math_percentile = [0, @math_percentile, 100].sort[1]
    @test_date += rand(30..60)  # days

    return {
      assessment_id: star_math_assessment_id,
      date_taken: @test_date,
      percentile_rank: @math_percentile,
      student_id: @student.id
    }
  end
end
