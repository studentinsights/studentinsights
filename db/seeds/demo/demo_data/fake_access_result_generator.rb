class FakeAccessResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def next
    {
      assessment_family_id: AssessmentFamily.access.id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      scale_score: rand(300..400),
      performance_level: rand(10),
      growth_percentile: rand(100),
      student_id: @student.id
    }
  end
end
