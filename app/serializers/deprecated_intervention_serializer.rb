class DeprecatedInterventionSerializer < Struct.new :intervention

  def serialize_intervention
    {
      id: intervention.id,
      name: intervention.name,
      intervention_type_id: intervention.intervention_type_id,
      comment: intervention.comment,
      goal: intervention.goal,
      start_date: intervention.start_date.strftime('%B %e, %Y'), # profile v1
      start_date_timestamp: intervention.start_date,
      end_date: intervention.end_date.try(:strftime, '%B %e, %Y'), # profile v1
      educator_email: intervention.educator.try(:email), # profile v1
      educator_id: intervention.educator.try(:id),
    }
  end

end
