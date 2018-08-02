class FakeStarMathResultGenerator

  def initialize(student, options = {})
    @student = student
    @test_date = options[:start_date] || DateTime.new(2010, 9, 1)
    @star_period_days = options[:star_period_days] || 90
    @math_percentile = rand(10..99)
  end

  def next
    @test_date += @star_period_days + rand(-10..10)  # days
    @grade_equivalent = ["0.00", "4.00", "5.70", "2.60"].sample

    return {
      date_taken: @test_date,
      percentile_rank: @math_percentile,
      grade_equivalent: @grade_equivalent,
      student_id: @student.id,
      total_time: rand(0..120)
    }
  end
end
