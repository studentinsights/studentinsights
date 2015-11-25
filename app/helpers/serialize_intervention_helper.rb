module SerializeInterventionHelper
  def serialize_intervention(intervention)
    {
      id: intervention.id,
      name: intervention.name,
      comment: intervention.comment,
      goal: intervention.goal,
      start_date: intervention.start_date.strftime('%B %e, %Y'),
      end_date: intervention.end_date.try(:strftime, '%B %e, %Y'),
      educator_email: intervention.educator.try(:email),
      progress_notes: intervention.progress_notes.order(created_at: :asc).map do |progress_note|
        serialize_progress_note(progress_note)
      end
    }
  end

  def serialize_progress_note(progress_note)
    {
      id: progress_note.id,
      educator_email: progress_note.educator.email,
      content: progress_note.content,
      created_date: progress_note.created_at.strftime("%B %e, %Y %l:%M %p")
    }
  end
end
