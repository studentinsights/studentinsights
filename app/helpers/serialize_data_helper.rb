module SerializeDataHelper
  def serialize_service(service)
    discontinued_service = service.discontinued_services.order(:recorded_at).last
    service.as_json.symbolize_keys.slice(*[
      :id,
      :student_id,
      :provided_by_educator_id,
      :service_type_id,
      :date_started,
      :recorded_by_educator_id,
      :recorded_at
    ]).merge({
      discontinued_by_educator_id: discontinued_service.try(:recorded_by_educator_id),
      discontinued_recorded_at: discontinued_service.try(:recorded_at)
    })
  end

  def serialize_event_note(event_note)
    event_note.as_json.symbolize_keys.slice(*[
      :id,
      :student_id,
      :educator_id,
      :event_note_type_id,
      :text,
      :recorded_at
    ])
  end

  # deprecated
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

  # deprecated
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

  # deprecated
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

  # Used to send down all types, for lookups from otherrecords
  def educators_index
    index = {}
    Educator.all.each do |educator|
      index[educator.id] = educator.as_json.symbolize_keys.slice(:id, :email, :full_name)
    end
    index
  end

  def service_types_index
    index = {}
    ServiceType.all.each do |service_type|
      index[service_type.id] = service_type.as_json.symbolize_keys.slice(:id, :name)
    end
    index
  end

  def event_note_types_index
    index = {}
    EventNoteType.all.each do |event_note_type|
      index[event_note_type.id] = event_note_type.as_json.symbolize_keys.slice(:id, :name)
    end
    index
  end

  # deprecated
  def intervention_types_index
    index = {}
    InterventionType.all.each do |intervention_type|
      index[intervention_type.id] = intervention_type.as_json.symbolize_keys.slice(:id, :name)
    end
    index
  end
end
