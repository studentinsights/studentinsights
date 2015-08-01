class FakeMcasMathResultGenerator
  def initialize
    @dates = (2010..2015).to_a.shuffle
  end

  def next
    {
      assessment_family_id: AssessmentFamily.mcas.id,
      assessment_subject_id: AssessmentSubject.math.id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      scale_score: rand(200..280),
      performance_level: ["W", "NI", "P", "A", nil].sample,
      growth_percentile: rand(100),
    }
  end
end
