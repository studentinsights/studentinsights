class BulkInterventionAssignment
  include ActiveModel::Model

  attr_accessor :student_ids, :intervention_type_id, :comment, :end_date,
    :educator_id, :goal

  def interventions
    if student_ids.present?
      Date.parse(end_date) if end_date.present?  # <~ Make sure we're passing valid dates in
      ActiveRecord::Base.transaction do          # <~ Wrap in block so that if one assignment
        student_ids.map do |s|                   #    attempt fails, all of them get rolled back
          student = Student.find(s)              # <~ Make sure there's a real student object there
          Intervention.create!(
            student_id: student.id,
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

end
