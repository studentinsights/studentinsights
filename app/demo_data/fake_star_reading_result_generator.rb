class FakeStarReadingResultGenerator
  def initialize(student, options = {}, index)
    @student = student
    @index = index
    @start_date = options.fetch(:start_date)
    @days_between_tests = options.fetch(:days_between_tests)
  end

  def next
    return {
      date_taken: @start_date + (@index * @days_between_tests),
      percentile_rank: rand(10..99),
      grade_equivalent: ["0.00", "4.00", "5.70", "2.60"].sample,
      instructional_reading_level: @student.grade.to_f + rand(-1..1),
      student_id: @student.id,
      total_time: rand(1000..1800)
    }
  end
end
