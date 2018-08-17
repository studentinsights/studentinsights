class FakeDibelsResultGenerator
  def initialize(student, options = {}, index)
    @student = student
    @index = index
    @start_date = options.fetch(:start_date)
    @days_between_tests = options.fetch(:days_between_tests)
  end

  def next
    {
      date_taken: @start_date + (@index * @days_between_tests),
      benchmark: ["Intensive", "Strategic", "Core"].sample.upcase,
      student_id: @student.id
    }
  end
end
