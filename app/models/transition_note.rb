class TransitionNote < ApplicationRecord
  belongs_to :educator
  belongs_to :student

  validates :educator, presence: true
  validates :student, presence: true

  validate :only_one_restricted_note, on: :create
  validate :only_one_regular_note, on: :create
  validate :cannot_change_is_restricted, on: :update

  # override, ensure that restricted text isn't accidentally serialized
  def as_json(options = {})
    json = super(options)
    RestrictedTextRedacter.new.redacted_as_json(
      super_json: json,
      restricted_key: 'text',
      is_restricted: self.is_restricted,
      as_json_options: options
    )
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
