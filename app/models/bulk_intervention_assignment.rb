class BulkInterventionAssignment
  include ActiveModel::Model

  attr_accessor :student_ids, :intervention_type_id, :comment, :end_date,
    :educator_id, :goal

  def interventions
    if student_ids.present?
      student_ids.map do |s|
        Intervention.create(
          comment: comment,
          end_date: end_date,
          intervention_type_id: intervention_type_id,
          goal: goal,
          educator_id: educator_id,
          start_date: Date.new
        )
      end
    end
  end

end
