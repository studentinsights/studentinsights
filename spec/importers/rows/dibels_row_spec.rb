require 'rails_helper'

RSpec.describe DibelsRow do

  let(:student) { FactoryBot.create(:student) }
  let(:base_row) {
    {
      assessment_test: 'DIBELS',
      local_id: student.local_id,
      assessment_date: Date.today,
    }
  }

  def make_row(benchmark)
    base_row.merge(assessment_performance_level: benchmark)
  end

  def parse_and_build_row(benchmark)
    DibelsRow.new(make_row(benchmark), student.id, LogHelper::FakeLog.new).build
  end

  it 'parses a row with benchmark CORE and saves a new record' do
    dibels_built_row = parse_and_build_row('CORE')
    expect(dibels_built_row.class).to eq DibelsResult
    expect(dibels_built_row.benchmark).to eq 'CORE'
    expect(dibels_built_row.subtest_results).to eq nil
  end

  it 'parses a row with benchmark "Benchmark" and saves a new record' do
    dibels_built_row = parse_and_build_row('Benchmark')
    expect(dibels_built_row.class).to eq DibelsResult
    expect(dibels_built_row.benchmark).to eq 'CORE'
    expect(dibels_built_row.subtest_results).to eq nil
  end

  it 'parses and saves a verbose row correctly' do
    dibels_built_row = parse_and_build_row('CORE 108/98% ORF')
    expect(dibels_built_row.class).to eq DibelsResult
    expect(dibels_built_row.benchmark).to eq 'CORE'
    expect(dibels_built_row.subtest_results).to eq '108/98% ORF'
  end

  it 'parses and saves a downcased row correctly' do
    dibels_built_row = parse_and_build_row('strategic 91/96%')
    expect(dibels_built_row.class).to eq DibelsResult
    expect(dibels_built_row.benchmark).to eq 'STRATEGIC'
    expect(dibels_built_row.subtest_results).to eq '91/96%'
  end

  it 'rejects a junk row and returns nil' do
    dibels_built_row = parse_and_build_row('#DIV/0!')
    expect(dibels_built_row).to eq nil
  end
end
