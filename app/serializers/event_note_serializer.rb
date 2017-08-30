class EventNoteSerializer < Struct.new :event_note

  def serialize_event_note
    attachments = event_note.event_note_attachments.map do |event_note_attachment|
      event_note_attachment.as_json.symbolize_keys.slice(:id, :url)
    end

    serialize_event_without_attachments.merge({
      attachments: attachments
    })
  end

  def serialize_event_without_attachments
    event_note.as_json(include: :event_note_revisions).symbolize_keys.slice(*[
      :id,
      :student_id,
      :educator_id,
      :event_note_type_id,
      :text,
      :recorded_at,
      :is_restricted,
      :event_note_revisions
    ])
  end

  def serialize_for_school_overview
    event_note.as_json.symbolize_keys.slice(*[
      :id,
      :student_id,
      :educator_id,
      :event_note_type_id,
      :recorded_at,
      :is_restricted,
    ])
  end

  def self.event_note_types_index
    index = {}
    EventNoteType.all.each do |event_note_type|
      index[event_note_type.id] = event_note_type.as_json.symbolize_keys.slice(:id, :name)
    end
    index
  end

end
