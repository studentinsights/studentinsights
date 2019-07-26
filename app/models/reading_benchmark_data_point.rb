# typed: true
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

  def self.doc_for(student_id, benchmark_school_year, benchmark_period_key)
    data_points = ReadingBenchmarkDataPoint.where({
      benchmark_school_year: benchmark_school_year,
      benchmark_period_key: benchmark_period_key,
      student_id: student_id
    }).order(updated_at: :asc)
    doc = data_points.reduce({}) do |map, data_point|
      map.merge({
        data_point.benchmark_assessment_key => data_point.json['value']
      })
    end
    doc.as_json
  end

  # see {benchmarkPeriodKeyFor} from readingData
  def self.benchmark_period_key_at(time_now)
    year = SchoolYear.to_school_year(time_now)
    fall_start = SchoolYear.first_day_of_school_for_year(year)
    winter_start = DateTime.new(year+1, 1, 1)
    spring_start = DateTime.new(year+1, 5, 1)
    summer_start = SchoolYear.last_day_of_school_for_year(year)

    if time_now >= fall_start && time_now < winter_start
      :fall
    elsif time_now >= winter_start && time_now < spring_start
      :winter
    elsif time_now >= spring_start && time_now < summer_start
      :spring
    else
      :summer
    end
  end

  # Relies on `student` for now
  def grid_key(student)
    [
      self.benchmark_school_year,
      self.benchmark_period_key,
      student.grade, # migrate this to be on this model instead
    ].join('-')
  end
end
