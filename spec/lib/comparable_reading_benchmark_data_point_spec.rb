require 'rails_helper'

RSpec.describe ComparableReadingBenchmarkDataPoint do
  let!(:pals) { TestPals.create! }

  def create_comparable(data_point_attrs = {})
    data_point = ReadingBenchmarkDataPoint.new({
      student_id: pals.healey_kindergarten_student.id,
      educator_id: pals.healey_vivian_teacher.id,
      benchmark_school_year: 2018,
      benchmark_period_key: 'fall',
      json: nil
    }.merge(data_point_attrs))
    ComparableReadingBenchmarkDataPoint.new(data_point)
  end

  def expect_ordering(a, b, c)
    expect([a, b, c].sort()).to eq [a, b, c]
    expect([c, b, a].sort()).to eq [a, b, c]
    expect(a.ordering < b.ordering).to eq true
    expect(b.ordering < c.ordering).to eq true
  end

  it 'handles nil F&P values' do
    a = create_comparable({
      benchmark_assessment_key: 'f_and_p_english',
      json: { value: 'A' }
    })
    b = create_comparable({
      benchmark_assessment_key: 'f_and_p_english',
      json: { value: 'B'}
    })
    n = create_comparable({
      benchmark_assessment_key: 'f_and_p_english',
      json: { value: nil }
    })
    expect_ordering(n, a, b)
  end

  it 'works for f_and_p_english' do
    a = create_comparable({
      benchmark_assessment_key: 'f_and_p_english',
      json: { value: 'C+'}
    })
    b = create_comparable({
      benchmark_assessment_key: 'f_and_p_english',
      json: { value: 'E/F'}
    })
    c = create_comparable({
      benchmark_assessment_key: 'f_and_p_english',
      json: { value: 'Z+'}
    })
    expect_ordering(a, b, c)
  end

  it 'works for dibels_fsf' do
    a = create_comparable({
      benchmark_assessment_key: 'dibels_fsf',
      json: { value: '9'}
    })
    b = create_comparable({
      benchmark_assessment_key: 'dibels_fsf',
      json: { value: '10'}
    })
    c = create_comparable({
      benchmark_assessment_key: 'dibels_fsf',
      json: { value: '12'}
    })
    expect_ordering(a, b, c)
  end

  it 'works for instructional_needs' do
    a = create_comparable({
      benchmark_assessment_key: 'instructional_needs',
      json: { value: 'engaging texts for practicing stamina' }
    })
    b = create_comparable({
      benchmark_assessment_key: 'instructional_needs',
      json: { value: 'phonics, consonant blends'}
    })
    c = create_comparable({
      benchmark_assessment_key: 'instructional_needs',
      json: { value: 'phonological awareness, elision'}
    })
    expect_ordering(a, b, c)
  end
end
