class TransitionNote < ApplicationRecord
  belongs_to :educator
  belongs_to :student

  validates :educator, presence: true
  validates :student, presence: true

  validate :just_two_per_student

  def just_two_per_student
    if student.transition_notes.count > 1
      errors.add(
        :student, 'cannot have more than two transition notes (one regular, one restricted)'
      )
    end
  end

end
