class StarReadingTestResult < ApplicationRecord
  belongs_to :student
  validates :percentile_rank, :grade_equivalent, :total_time, :student,
    :instructional_reading_level, presence: true
  validate :valid_percentile_rank

  def valid_percentile_rank
    errors.add(:percentile_rank, "too high") if percentile_rank > 99
    errors.add(:percentile_rank, "too low") if percentile_rank < 1
  end
end
