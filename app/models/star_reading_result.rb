# This is a new model that forks STAR Math off the monolith student_assessment model.
# Migrating over in stages:
#   - First, dump data from the import process into the new model's table.
#   - Next, point endpoints in the app over to read from the new table.
#     (The app may be showing slightly stale data until this step is shipped.)
#   - Finally, remove STAR results from the student_assessment model/table.
class StarReadingResult < ApplicationRecord
  belongs_to :student
  validates :percentile_rank, :grade_equivalent, :total_time, :student,
    :instructional_reading_level, presence: true
  validate :valid_percentile_rank

  def valid_percentile_rank
    errors.add(:percentile_rank, "too high") if percentile_rank > 99
    errors.add(:percentile_rank, "too low") if percentile_rank < 1
  end
end
