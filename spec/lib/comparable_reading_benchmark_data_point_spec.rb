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

  it 'works for dibel_fsf' do
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
    expect([a, b, c].sort()).to eq [a, b, c]
    expect([c, b, a].sort()).to eq [a, b, c]
    expect(a.ordering < b.ordering).to eq true
    expect(b.ordering < c.ordering).to eq true
  end

  it 'works for dibel_fsf' do
    a = create_comparable({
      benchmark_assessment_key: 'dibel_fsf',
      json: { value: '9'}
    })
    b = create_comparable({
      benchmark_assessment_key: 'dibel_fsf',
      json: { value: '10'}
    })
    c = create_comparable({
      benchmark_assessment_key: 'dibel_fsf',
      json: { value: '12'}
    })
    expect([a, b, c].sort()).to eq [a, b, c]
    expect([c, b, a].sort()).to eq [a, b, c]
    expect(a.ordering < b.ordering).to eq true
    expect(b.ordering < c.ordering).to eq true
  end
end
