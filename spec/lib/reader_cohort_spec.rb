require 'rails_helper'

RSpec.describe ReaderCohort do
  def create_data_point_for(benchmark_assessment_key, values)
    values.each_with_index.map do |value, index|
      key = [index, Time.now.nsec].join('-')
      other_student =  Student.create!(
        first_name: "test_student_first:#{key}",
        last_name: "test_student_last:#{key}",
        local_id: "test_student_local_id:#{key}",
        school: pals.healey,
        homeroom: pals.healey_kindergarten_homeroom,
        grade: 'KF',
        enrollment_status: 'Active'
      )
      ReadingBenchmarkDataPoint.create!({
        student: other_student,
        educator: pals.uri,
        benchmark_school_year: 2018,
        benchmark_period_key: :fall,
        benchmark_assessment_key: benchmark_assessment_key,
        json: { value: value }
      })
    end
  end


  describe '#interpret_f_and_p_english' do
    let!(:pals) { TestPals.create! }

    it 'works' do
      odie =  Student.create!(
        first_name: 'Odie',
        last_name: 'TheDog',
        school: pals.healey,
        homeroom: pals.healey_kindergarten_homeroom,
        grade: 'KF',
        local_id: '111331111',
        state_id: '991331111',
        enrollment_status: 'Active'
      )
      ReadingBenchmarkDataPoint.create!({
        student: odie,
        educator: pals.uri,
        benchmark_school_year: 2018,
        benchmark_period_key: :fall,
        benchmark_assessment_key: :dibels_fsf,
        json: { value: 22 }
      })
      ReadingBenchmarkDataPoint.create!({
        student: pals.healey_kindergarten_student,
        educator: pals.uri,
        benchmark_school_year: 2018,
        benchmark_period_key: :fall,
        benchmark_assessment_key: :dibels_fsf,
        json: { value: 40 }
      })
      ReadingBenchmarkDataPoint.create!({
        student: pals.healey_kindergarten_student,
        educator: pals.uri,
        benchmark_school_year: 2018,
        benchmark_period_key: :winter,
        benchmark_assessment_key: :dibels_fsf,
        json: { value: 50 }
      })

      benchmark_assessment_key = 'dibels_fsf'
      school_years = [pals.time_now.year - 1, pals.time_now.year]
      cohort = ReaderCohort.new(pals.healey_kindergarten_student, time_now: pals.time_now)
      expect(cohort.reader_cohort_json(benchmark_assessment_key, school_years)).to eq({
        :benchmark_assessment_key => "dibels_fsf",
        :cells => {
          "2018-fall"=>{
            :value=>40,
            :stats=>{
              :n_lower=>1,
              :n_equal=>0,
              :n_higher=>0,
              :p=>100
            }
          },
          "2018-winter"=>{
            :value=>50,
            :stats=>nil
          }
        },
        :comparison_students => 1,
        :school_years => [2017, 2018],
        :student_id => pals.healey_kindergarten_student.id,
        :time_now => pals.time_now
      })
    end
  end

  describe '#stats' do
    let!(:pals) { TestPals.create! }

    def test_stats(benchmark_assessment_key, value, values)
      cohort = ReaderCohort.new(pals.healey_kindergarten_student, time_now: pals.time_now)
      data_point = create_data_point_for(benchmark_assessment_key, [value]).first
      shuffled_comparison_data_points = create_data_point_for(benchmark_assessment_key, values).shuffle # enforce that order doesn't matter
      cohort.send(:stats, data_point, shuffled_comparison_data_points)
    end

    it 'returns nil if no values' do
      expect(test_stats('f_and_p_english', 'C', [nil, nil])).to eq nil
    end
    
    it 'filters out nils' do
      with_nils = test_stats('f_and_p_english', 'C', [nil, nil, 'F', nil])
      without_nils = test_stats('f_and_p_english', 'C', ['F'])
      expected_stats = {
        :n_lower => 0,
        :n_equal => 0,
        :n_higher => 1,
        :p => 0
      }
      expect(with_nils).to eq(expected_stats)
      expect(without_nils).to eq(expected_stats)
    end
  end

  describe '#stats_percentiles' do
    let!(:pals) { TestPals.create! }

    def create_for(benchmark_assessment_key, values)
      data_points = create_data_point_for(benchmark_assessment_key, values)
      data_points.map do |data_point|
        ComparableReadingBenchmarkDataPoint.new(data_point)
      end
    end

    def test_percentiles(benchmark_assessment_key, value, values)
      cohort = ReaderCohort.new(pals.healey_kindergarten_student, time_now: pals.time_now)
      anchor = create_for(benchmark_assessment_key, [value]).first
      shuffled_others = create_for(benchmark_assessment_key, values).shuffle # enforce that order doesn't matter
      cohort.send(:stats_percentiles, anchor, shuffled_others)
    end

    it 'does the math correctly' do
      expect(test_percentiles('dibels_fsf', 20, [])).to eq(nil)
      expect(test_percentiles('dibels_fsf', 20, [40])).to eq({
        :n_lower => 0,
        :n_equal => 0,
        :n_higher => 1,
        :p => 0
      })
      expect(test_percentiles('dibels_fsf', 30, [10, 20, 40, 60])).to eq({
        :n_lower => 2,
        :n_equal => 0,
        :n_higher => 2,
        :p => 50,
      })
      expect(test_percentiles('dibels_fsf', 10, [1,1,1,1,1,1,1,1,10,10])).to eq({
        :n_lower => 8,
        :n_equal => 2,
        :n_higher => 0,
        :p => 90,
      })
      expect(test_percentiles('dibels_fsf', 10, [1,1,1,1,1,1,1,1,20,20])).to eq({
        :n_lower => 8,
        :n_equal => 0,
        :n_higher => 2,
        :p => 80,
      })
      expect(test_percentiles('dibels_fsf', 20, [10, 40, 60])).to eq({
        :n_lower => 1,
        :n_equal => 0,
        :n_higher => 2,
        :p => 33,
      })
    end

    it 'uses Comparable and so works for F&P' do
      expect(test_percentiles('f_and_p_english', 'C', [])).to eq(nil)
      expect(test_percentiles('f_and_p_english', 'C', ['F'])).to eq({
        :n_lower => 0,
        :n_equal => 0,
        :n_higher => 1,
        :p => 0
      })
      expect(test_percentiles('f_and_p_english', 'C', ['C', 'C', 'D', 'D'])).to eq({
        :n_lower => 0,
        :n_equal => 2,
        :n_higher => 2,
        :p => 25,
      })
      expect(test_percentiles('f_and_p_english', 'C', ['C', 'NR', 'NR', 'F', 'D'])).to eq({
        :n_lower => 2,
        :n_equal => 1,
        :n_higher => 2,
        :p => 50
      })
    end
  end
end
