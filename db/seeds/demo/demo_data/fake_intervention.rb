class FakeIntervention

  def initialize(student)
    @student = student
    @start_date = Date.new(
      (2010..2015).to_a.sample,
      (1..12).to_a.sample,
      (1..28).to_a.sample
    )
    @educator = Educator.first_or_create!
    @intervention_type = InterventionType.atp
  end

  def next
    {
      start_date: @start_date,
      end_date: @start_date + (152..365).to_a.sample.days,
      educator_id: @educator.id,
      intervention_type_id: @intervention_type.id,
      student_id: @student.id,
      number_of_hours: rand(0..40)
    }
  end

end
