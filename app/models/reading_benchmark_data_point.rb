class ReadingBenchmarkDataPoint < ApplicationRecord
  VALID_BENCHMARK_PERIOD_KEYS = ['fall', 'winter', 'spring']
  VALID_BENCHMARK_ASSESSMENT_KEYS = [
    'dibels_fsf',
    'dibels_lnf',
    'dibels_psf',
    'dibels_nwf_cls',
    'dibels_nwf_wwr',
    'dibels_dorf_wpm',
    'dibels_dorf_errors',
    'dibels_dorf_acc',
    'f_and_p_english',
    'f_and_p_spanish',
    'instructional_needs'
  ]

  belongs_to :student
  belongs_to :educator # recorded by

  validates :student, presence: true
  validates :educator, presence: true

  validates :benchmark_school_year, presence: true
  validates :benchmark_period_key, inclusion: {
    in: VALID_BENCHMARK_PERIOD_KEYS,
    message: "%{value} is not one of: #{VALID_BENCHMARK_PERIOD_KEYS.join(', ')}"
  }
  validates :benchmark_assessment_key, inclusion: {
    in: VALID_BENCHMARK_ASSESSMENT_KEYS,
    message: "%{value} is not one of: #{VALID_BENCHMARK_ASSESSMENT_KEYS.join(', ')}"
  }
  validates :json, presence: true
end
