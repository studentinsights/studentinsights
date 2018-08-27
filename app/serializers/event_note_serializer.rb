class EventNoteSerializer < Struct.new :event_note, :options
  def self.safe(event_note)
    EventNoteSerializer.new(event_note, {})
  end

  def self.dangerously_include_restricted_note_text(event_note)
    EventNoteSerializer.new(event_note, {
      event_note_as_json_options: {
        dangerously_include_restricted_note_text: true
      }
    })
  end

  def serialize_event_note_with_student
    student = {
      first_name: event_note.student.first_name,
      last_name: event_note.student.last_name,
      id: event_note.student.id,
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

  # Allow passing options to EventNote#as_json with options[:event_note_as_json_options]
  def serialize_event_without_attachments
    event_note_as_json_options = options.fetch(:event_note_as_json_options, {})
    as_json_options = { include: :event_note_revisions }.merge(event_note_as_json_options)
    event_note.as_json(as_json_options).symbolize_keys.slice(*[
      :id,
      :student_id,
      :educator_id,
      :event_note_type_id,
      :text,
      :recorded_at,
      :is_restricted,
    ]).merge(event_note_revisions_count: event_note.event_note_revisions.size)
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
end
