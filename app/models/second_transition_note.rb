class SecondTransitionNote < ApplicationRecord
  SOMERVILLE_TRANSITION_2019 = 'somerville_8th_to_9th_grade' # also used for 5th > 6th
  SOMERVILLE_TRANSITION_2019_KEYS = [
    'strengths',
    'connecting',
    'community',
    'peers',
    'family',
    'other'
  ]

  belongs_to :educator
  belongs_to :student

  validates :educator, presence: true
  validates :student, presence: true
  validates :recorded_at, presence: true
  validates :form_json, presence: true
  validates :form_key, inclusion: {
    in: [
      SOMERVILLE_TRANSITION_2019
    ]
  }
  validate :validate_form_json_keys

  def has_restricted_text
    self.restricted_text.try(:strip).present?
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
    json.merge('restricted_text' => EventNote::REDACTED)
  end

  private
  def validate_form_json_keys
    if self.form_key == SOMERVILLE_TRANSITION_2019
      missing_keys = (SOMERVILLE_TRANSITION_2019_KEYS - self.form_json.keys).sort
      errors.add(:form_json, "missing expected keys: #{missing_keys.join(',')}") if missing_keys.size > 0

      extra_keys = (self.form_json.keys - SOMERVILLE_TRANSITION_2019_KEYS).sort
      errors.add(:form_json, "extra keys: #{extra_keys.join(',')}") if extra_keys.size > 0
    end
  end
end
