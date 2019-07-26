# typed: true
class ReadingGroupingSnapshot < ApplicationRecord
  VALID_BENCHMARK_PERIOD_KEYS = ['fall', 'winter', 'spring']

  belongs_to :school
  belongs_to :educator # recorded by

  validates :educator, presence: true
  validates :school, presence: true
  validates :grade, inclusion: { in: GradeLevels::ORDERED_GRADE_LEVELS }
  validates :benchmark_school_year, presence: true
  validates :benchmark_period_key, inclusion: {
    in: VALID_BENCHMARK_PERIOD_KEYS,
    message: "%{value} is not one of: #{VALID_BENCHMARK_PERIOD_KEYS.join(', ')}"
  }

  validates :grouping_workspace_id, presence: true
  validates :snapshot_json, presence: true
end
