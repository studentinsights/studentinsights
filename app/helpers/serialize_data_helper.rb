module SerializeDataHelper

  def serialize_intervention(intervention)
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
      progress_notes: intervention.progress_notes.order(created_at: :asc).map do |progress_note|
        serialize_progress_note(progress_note)
      end
    }
  end

  def serialize_progress_note(progress_note)
    {
      id: progress_note.id,
      educator_email: progress_note.educator.email,
      educator_id: progress_note.educator.id,
      content: progress_note.content,
      created_date: progress_note.created_at.strftime("%B %e, %Y %l:%M %p"),
      created_at_timestamp: progress_note.created_at
    }
  end

  def serialize_student_note(student_note)
    {
      id: student_note.id,
      content: student_note.content,
      educator_id: student_note.educator.id,
      educator_email: student_note.educator.email,
      created_at_timestamp: student_note.created_at,
      created_at: student_note.created_at.strftime('%B %e, %Y')
    }
  end

  # Used to send down all intervention types, for lookups from student records
  def intervention_types_index
    index = {}
    InterventionType.all.each do |intervention_type|
      index[intervention_type.id] = intervention_type
    end
    index
  end

  # Used to send down all educators, for lookups from other records
  def educators_index
    index = {}
    Educator.all.each do |educator|
      index[educator.id] = educator
    end
    index
  end

  # Used to send down constants to the UI
  def service_types_index
    index = {}
    ServiceType.all.each do |service_type|
      index[service_type.id] = service_type
    end
    index
  end
end
