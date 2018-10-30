class FakeAccessResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def access_assessment_id
    @assessment_id ||= Assessment.find_by_family_and_subject('ACCESS', 'Composite').id
  end

  def next
    {
      assessment_id: access_assessment_id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      scale_score: rand(300..400),
      performance_level: rand(10),
      growth_percentile: 1+rand(99),
      student_id: @student.id
    }
  end
end
