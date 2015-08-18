class FakeDibelsResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def next
    {
      assessment_id: Assessment.dibels.id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      performance_level: ["Intensive", "Strategic", "Core", "Benchmark", "CORE", nil].sample,
      student_id: @student.id
    }
  end
end
