class FakeInterventionGenerator

  def initialize(student)
    @date = DateTime.new(2010, 9, 1)
    @student = student
  end

  def next
    @date += rand(30..60)  # days
    intervention_type = sample_intervention_type
    educator = Educator.where(admin: true).first

    return {
      student_id: @student.id,
      intervention_type_id: intervention_type.id,
      comment: comment_for(intervention_type),
      start_date: @date,
      end_date: @date + 2.weeks,
      educator_id: educator.id,
      number_of_hours: rand(1..8),
      goal: goal_for(intervention_type),
      custom_intervention_name: nil,
      progress_notes: generate_progress_notes_for(intervention_type, educator)
    }
  end

  def sample_intervention_type
    InterventionType.all.sample
  end

  def comment_for(intervention_type)
    ['foo', 'bar', 'whatever'].sample
  end

  def goal_for(intervention_type)
    ['reduce behavior', 'increase behavior', 'pass assessment', 'increase growth percentile'].sample
  end

  def generate_progress_notes_for(intervention_type, educator)
    []
  end
end
