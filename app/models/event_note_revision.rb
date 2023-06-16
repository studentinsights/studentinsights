class EventNoteRevision < ApplicationRecord
  belongs_to :event_note
  belongs_to :educator
  belongs_to :student
  belongs_to :event_note_type

  validates :educator, :student, :event_note_type, :event_note, :version, :text, presence: true

  # override
  def as_json(options = {})
    json = super(options)
    RestrictedTextRedacter.new.redacted_as_json(
      super_json: json,
      restricted_key: 'text',
      is_restricted: self.event_note.is_restricted,
      as_json_options: options
    )
  end
end
