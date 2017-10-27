class FakeNextGenMcasElaResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def mcas_ela_assessment_id
    @assessment_id ||= Assessment.find_by_family_and_subject(
      'Next Gen MCAS', 'ELA'
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
      assessment_id: mcas_ela_assessment_id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      scale_score: rand(400..600),
      performance_level: performance_levels.sample,
      growth_percentile: rand(100),
      student_id: @student.id
    }
  end
end
