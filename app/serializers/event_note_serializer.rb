class EventNoteSerializer < Struct.new :event_note

  def serialize_event_note_with_student
    student = {
      first_name: event_note.student.first_name,
      last_name: event_note.student.last_name,
      school_id: event_note.student.school_id,
      school_name: event_note.student.school.try(:name) || "",
      homeroom_id: event_note.student.homeroom_id,
      homeroom_name: event_note.student.homeroom.try(:name) || "",
      grade: event_note.student.grade.to_i
    }
    serialize_event_note.merge({
      student: student
    })
  end

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
