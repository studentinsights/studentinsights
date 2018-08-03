class FakeNextGenMcasMathResultGenerator
  def initialize(student, options = {}, index)
    @student = student
    @index = index
    @start_date = options.fetch(:start_date)
    @days_between_tests = options.fetch(:days_between_tests)
  end

  def mcas_mathematics_assessment_id
    @assessment_id ||= Assessment.find_by_family_and_subject(
      'Next Gen MCAS', 'Mathematics'
    ).id
  end

  def performance_levels
    [
      'Not Meeting Expectations',
      'Partially Meeting',
      'Meeting Expectations',
      'Exceeding Expectations',
    ]
  end

  def next
    {
      assessment_id: mcas_mathematics_assessment_id,
      date_taken: @start_date + (@index * @days_between_tests),
      scale_score: rand(400..600),
      performance_level: performance_levels.sample,
      growth_percentile: rand(10..99),
      student_id: @student.id
    }
  end
end
