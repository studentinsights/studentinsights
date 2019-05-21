class SecondTransitionNote < ApplicationRecord
  SOMERVILLE_8TH_TO_9TH_GRADE = 'somerville_8th_to_9th_grade'

  belongs_to :educator
  belongs_to :student

  validates :educator, presence: true
  validates :student, presence: true
  validates :form_json, presence: true
  validates :form_key, inclusion: {
    in: [
      SOMERVILLE_8TH_TO_9TH_GRADE
    ]
  }
  validate :validate_form_json_keys

  def has_restricted_text
    self.restricted_text.present?
  end

  # override
  # Ensures that restricted information doesn't accidentally serialized
  # without explicitly asking for it.  The text for restricted info will
  # always be redacted, regardless of the user, unless it is explicitly
  # asked for.
  # See also EventNote#as_json and EventNoteRevision#as_json.
  def as_json(options = {})
    json = super(options)

    # if not serializing the text content it's okay
    return json unless json.has_key?('restricted_text')

    # allow a dangerous manual override
    return json if options[:dangerously_include_restricted_text]

    # silently redact
    json.merge('restricted_text' => '<redacted>')
  end

  private
  def validate_form_json_keys
    if self.form_key == SOMERVILLE_8TH_TO_9TH_GRADE && self.form_json.keys.size == 0
      errors.add(:form_json, 'no keys found')
    end
  end
end
