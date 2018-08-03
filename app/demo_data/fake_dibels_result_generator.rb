class FakeDibelsResultGenerator
  def initialize(student, options = {}, index)
    @student = student
    @index = index
    @start_date = options.fetch(:start_date)
    @days_between_tests = options.fetch(:days_between_tests)
  end

  def dibels_assessment_id
    @assessment_id ||= Assessment.find_by_family('DIBELS').id
  end

  def next
    {
      assessment_id: dibels_assessment_id,
      date_taken: @start_date + (@index * @days_between_tests),
      performance_level: ["Intensive", "Strategic", "Core"].sample,
      student_id: @student.id
    }
  end
end
