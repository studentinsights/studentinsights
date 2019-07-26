# typed: false
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
    }
  end

  private
  def sample_intervention_type
    InterventionType.all.sample
  end

  def comment_for(intervention_type)
    ['Something happened.', 'The student had a tough day.', 'This intervention has worked well.'].sample
  end

  def goal_for(intervention_type)
    ['Reduce behavior.', 'Increase how often the student is engaged in positive behaviors.', 'The student will pass the assessment.', 'Increase growth percentile for this academic subject.'].sample
  end

end
