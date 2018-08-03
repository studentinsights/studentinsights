class FakeMcasMathResultGenerator
  def initialize(student, options = {}, index)
    @student = student
    @index = index
    @start_date = options.fetch(:start_date)
    @days_between_tests = options.fetch(:days_between_tests)
  end

  def mcas_mathematics_assessment_id
    @assessment_id ||= Assessment.find_by_family_and_subject('MCAS', 'Mathematics').id
  end

  def next
    {
      assessment_id: mcas_mathematics_assessment_id,
      date_taken: @start_date + (@index * @days_between_tests),
      scale_score: rand(200..280),
      performance_level: ["W", "NI", "P", "A", nil].sample,
      growth_percentile: rand(10..99),
      student_id: @student.id
    }
  end
end
