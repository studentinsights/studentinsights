module SerializeDataHelper
  def serialize_service(service)
    discontinued_service = service.discontinued_services.order(:recorded_at).last
    service.as_json.symbolize_keys.slice(*[
      :id,
      :student_id,
      :provided_by_educator_name,
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
    attachment_urls = event_note.event_note_attachments.pluck(:url)

    event_note.as_json.symbolize_keys.slice(*[
      :id,
      :student_id,
      :educator_id,
      :event_note_type_id,
      :text,
      :recorded_at,
      :is_restricted
    ]).merge(
      attachment_urls: attachment_urls
    )
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
    }
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
end
