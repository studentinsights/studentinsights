require 'rails_helper'

RSpec.describe ReadingBenchmarkDataPoint do
  describe '#benchmark_period_key_at' do
    it 'works' do
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2018, 9, 1))).to eq :fall
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2018, 10, 1))).to eq :fall
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2018, 11, 15))).to eq :fall
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2018, 12, 30))).to eq :fall
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2019, 1, 1))).to eq :winter
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2019, 4, 30))).to eq :winter
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2019, 5, 1))).to eq :spring
      expect(ReadingBenchmarkDataPoint.benchmark_period_key_at(DateTime.new(2019, 7, 1))).to eq :summer
    end
  end

  describe '#doc_for' do
    let!(:pals) { TestPals.create! }
    let!(:time_now) { pals.time_now }
    let!(:school_year) { SchoolYear.to_school_year(time_now) }
    let!(:student) { FactoryBot.create(:student, grade: '1') }
    before do
      ReadingBenchmarkDataPoint.create!({
        student: student,
        educator: pals.uri,
        benchmark_school_year: school_year,
        benchmark_period_key: :winter,
        benchmark_assessment_key: :dibels_dorf_wpm,
        json: { value: 101 }
      })
      ReadingBenchmarkDataPoint.create!({
        student: student,
        educator: pals.uri,
        benchmark_school_year: school_year,
        benchmark_period_key: :winter,
        benchmark_assessment_key: :dibels_dorf_acc,
        json: { value: 96 }
      })
      ReadingBenchmarkDataPoint.create!({
        student: student,
        educator: pals.uri,
        benchmark_school_year: school_year,
        benchmark_period_key: :spring,
        benchmark_assessment_key: :f_and_p_english,
        json: { value: 'B' }
      })
    end

    it 'queries correctly, only for period' do
      expect(ReadingBenchmarkDataPoint.doc_for(student.id, school_year, :fall)).to eq({})
      expect(ReadingBenchmarkDataPoint.doc_for(student.id, school_year, :winter)).to eq({
        'dibels_dorf_acc' => 96,
        'dibels_dorf_wpm' => 101,
      })
      expect(ReadingBenchmarkDataPoint.doc_for(student.id, school_year, :spring)).to eq({
        'f_and_p_english' => 'B'
      })
      expect(ReadingBenchmarkDataPoint.doc_for(student.id, school_year, :summer)).to eq({})
    end
  end
end
