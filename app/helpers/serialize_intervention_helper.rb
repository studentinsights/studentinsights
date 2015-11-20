module SerializeInterventionHelper
  def serialize_intervention(intervention)
    {
      id: intervention.id,
      name: intervention.name,
      comment: intervention.comment,
      goal: intervention.goal,
      start_date: intervention.start_date.strftime('%B %e, %Y'),
      end_date: intervention.end_date.try(:strftime, '%B %e, %Y'),
      educator_email: intervention.educator.try(:email)
    }
  end
end
