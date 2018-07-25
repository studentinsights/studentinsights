class FakeMcasMathResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def mcas_mathematics_assessment_id
    @assessment_id ||= Assessment.find_by_family_and_subject('MCAS', 'Mathematics').id
  end

  def next
    {
      assessment_id: mcas_mathematics_assessment_id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      scale_score: rand(200..280),
      performance_level: ["W", "NI", "P", "A"].sample,
      growth_percentile: rand(100),
      student_id: @student.id
    }
  end
end
