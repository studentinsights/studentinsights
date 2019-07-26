# typed: strong
# deprecated, see ReadingBenchmarkDataPoint
class FAndPAssessment < ApplicationRecord
  belongs_to :student
  belongs_to :uploaded_by_educator, class_name: 'Educator'

  validates :student, presence: true
  validates :uploaded_by_educator, presence: true
  validates :instructional_level, presence: true
  validates :benchmark_date, presence: true # not the same as actual assessment date
end
