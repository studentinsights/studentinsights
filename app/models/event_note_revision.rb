class EventNoteRevision < ActiveRecord::Base
  belongs_to :event_note
  belongs_to :educator
  belongs_to :student
  belongs_to :event_note_type

  validates :educator, :student, :event_note_type, :event_note, presence: true

  # override
  # Ensures that text for revisions on restricted notes don't get accidentally
  # serialized without explicitly asking for them.  See also EventNote#as_json.
  def as_json(options = {})
    json = super(options)

    # unrestricted notes are safe to serialize
    return json unless self.event_note.is_restricted

    # if a restricted note isn't serializing the text content it's okay
    return json unless json.has_key?('text')

    # allow a dangerous manual override
    return json if options[:dangerously_include_restricted_note_text]

    # redact text content
    json.merge('text' => '<redacted>')
  end
end
