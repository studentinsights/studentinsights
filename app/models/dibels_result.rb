# This model stores data for the DIBELS K-6 literacy assessment:
# https://dibels.uoregon.edu/assessment/dibels

# NOTE: Right now DIBELS data is stored in both this table (where we want to
# read from eventually) and in the student_assessments table (where we want to
# move away from). The next move is to change the controller and client code
# to read data from this table. After that we can safely delete DIBELS
# rows in the student_assessments table.

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
