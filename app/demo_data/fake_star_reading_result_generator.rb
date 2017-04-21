class FakeStarReadingResultGenerator
  def initialize(student, options)
    @student = student
    @test_date = options[:start_date] || DateTime.new(2010, 9, 1)
    @star_period_days = options[:star_period_days] || 90
    @instructional_reading_level = @student.grade.to_f
    @reading_percentile = rand(10..99)
  end

  def star_reading_assessment
    @assessment ||= Assessment.find_by_family_and_subject('STAR', 'Reading')
  end

  def next
    @reading_percentile += rand(-15..15)
    @reading_percentile = [0, @reading_percentile, 100].sort[1]
    @instructional_reading_level += rand(-1..1)
    @test_date += @star_period_days + rand(-10..10)  # days
    @grade_equivalent = [
      nil, nil, nil, nil, "0.00", "4.00", "5.70", "2.60"
    ].sample

    return {
      assessment: star_reading_assessment,
      date_taken: @test_date,
      percentile_rank: @reading_percentile,
      grade_equivalent: @grade_equivalent,
      instructional_reading_level: @instructional_reading_level,
      student_id: @student.id
    }
  end
end
