class FakeServiceGenerator

  def initialize(student)
    @date = DateTime.new(2010, 9, 1)
    @student = student
  end

  def next
    @date += rand(30..60)  # days
    educator = Educator.where(admin: true).first

    return {
      student_id: @student.id,
      service_type_id: ServiceType.all.sample.id,
      provided_by_educator_id: educator.id,
      date_started: @date - rand(0..7),
      recorded_at: @date,
      recorded_by_educator_id: Educator.all.sample.id
    }
  end
end
