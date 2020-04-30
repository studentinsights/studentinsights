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

  # override, ensure that restricted text isn't accidentally serialized
  def as_json(options = {})
    json = super(options)
    RestrictedTextRedacter.new.redacted_as_json({
      super_json: json,
      restricted_key: 'restricted_text',
      is_restricted: self.is_restricted,
      as_json_options: options
    })
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
