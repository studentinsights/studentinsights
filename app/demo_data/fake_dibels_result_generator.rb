class FakeDibelsResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def dibels_assessment_id
    @assessment_id ||= Assessment.find_by_family('DIBELS').id
  end

  def next
    {
      assessment_id: dibels_assessment_id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      performance_level: ["Intensive", "Strategic", "Core"].sample,
      student_id: @student.id
    }
  end
end
