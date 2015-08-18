class FakeDibelsResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def next
    {
      assessment_id: Assessment.dibels.last_or_missing.id,
      date_taken: DateTime.new(@dates.pop, 5, 15),
      performance_level: ["Intensive", "Strategic", "Core", nil].sample,
      student_id: @student.id
    }
  end
end
