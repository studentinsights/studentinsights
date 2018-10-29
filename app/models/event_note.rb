class EventNote < ApplicationRecord
  belongs_to :educator
  belongs_to :student
  belongs_to :event_note_type
  has_many   :event_note_revisions, dependent: :destroy

  has_many :event_note_attachments, dependent: :destroy
  accepts_nested_attributes_for :event_note_attachments

  validates :educator, :student, :event_note_type, :recorded_at, :text, presence: true
  validates :is_restricted, inclusion: { in: [true, false] }

  REDACTED = '<redacted>'

  # override
  # Ensures that text for restricted notes don't get accidentally serialized
  # without explicitly asking for them.  The text for restricted notes will always be
  # redacted, regardless of the user, unless it is explicitly asked for.
  # See also EventNoteRevision#as_json.
  def as_json(options = {})
    json = super(options)

    # unrestricted notes are safe to serialize
    return json unless self.is_restricted

    # if a restricted note isn't serializing the text content it's okay
    return json unless json.has_key?('text')

    # allow a dangerous manual override
    return json if options[:dangerously_include_restricted_note_text]

    # redact text content
    json.merge('text' => '<redacted>')
  end
end
