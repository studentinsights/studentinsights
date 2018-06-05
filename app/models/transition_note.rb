class TransitionNote < ApplicationRecord
  belongs_to :educator
  belongs_to :student

  validates :educator, presence: true
  validates :student, presence: true

  validate :only_one_restricted_note, on: :create
  validate :only_one_regular_note, on: :create

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
end
