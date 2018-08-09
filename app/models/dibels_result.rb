# This model stores data for the DIBELS K-6 literacy assessment:
# https://dibels.uoregon.edu/assessment/dibels

class DibelsResult < ApplicationRecord
  VALID_BENCHMARK_SCORES = ['CORE', 'INTENSIVE', 'STRATEGIC']

  belongs_to :student

  validates :benchmark, inclusion: {
    in: VALID_BENCHMARK_SCORES,
    message: "%{value} is not one of: #{VALID_BENCHMARK_SCORES.join(', ')}"
  }

  # These are also enforced with constraints at the database level:
  validates :benchmark, :student, presence: true
end