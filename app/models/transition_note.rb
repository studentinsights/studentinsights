class TransitionNote < ApplicationRecord
  belongs_to :educator
  belongs_to :student

  validates :educator, presence: true
  validates :student, presence: true

  validate :only_one_restricted_note, on: :create
  validate :only_one_regular_note, on: :create
  validate :cannot_change_is_restricted, on: :update

  # override
  # Ensures that text for restricted notes don't get accidentally serialized
  # without explicitly asking for them.  The text for restricted notes will always be
  # redacted, regardless of the user, unless it is explicitly asked for.
  # See also EventNote#as_json and EventNoteRevision#as_json.
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

  private
  def only_one_restricted_note
    if is_restricted && student.present? && student.transition_notes.where(is_restricted: true).count > 0
      errors.add(:student, 'cannot have more than one restricted note')
    end
  end

  def only_one_regular_note
    if !is_restricted && student.present? && student.transition_notes.where(is_restricted: false).count > 0
      errors.add(:student, 'cannot have more than one regular note')
    end
  end

  def cannot_change_is_restricted
    if self.persisted? && is_restricted_changed?
      errors.add(:is_restricted, 'changing is_restricted is not allowed')
    end
  end
end
