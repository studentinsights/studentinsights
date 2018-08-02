class StarMathResult < ApplicationRecord
  belongs_to :student
  validate :valid_percentile_rank

  # These are also enforced with constraints at the database level:
  validates :percentile_rank, :grade_equivalent, :total_time, :student, presence: true

  def valid_percentile_rank
    return unless percentile_rank
    errors.add(:percentile_rank, "too high") && return if percentile_rank > 99
    errors.add(:percentile_rank, "too low") && return if percentile_rank < 1
  end
end
