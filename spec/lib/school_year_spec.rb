# typed: false
require 'spec_helper'

RSpec.describe SchoolYear do
  it '.first_day_of_school_for_year' do
    expect(SchoolYear.first_day_of_school_for_year(2016)).to eq(DateTime.parse('2016-08-15'))
    expect(SchoolYear.first_day_of_school_for_year(2013)).to eq(DateTime.parse('2013-08-15'))
  end

  it '.last_day_of_school_for_year' do
    expect(SchoolYear.last_day_of_school_for_year(2016)).to eq(DateTime.parse("2017-06-30"))
    expect(SchoolYear.last_day_of_school_for_year(2013)).to eq(DateTime.parse("2014-06-30"))
  end

  it '.to_school_year' do
    expect(SchoolYear.to_school_year(DateTime.parse('2013-09-12'))).to eq(2013)
    expect(SchoolYear.to_school_year(DateTime.parse('2014-05-12'))).to eq(2013)
    expect(SchoolYear.to_school_year(DateTime.parse('2014-08-19'))).to eq(2014)
    expect(SchoolYear.to_school_year(DateTime.parse('2014-11-19'))).to eq(2014)
  end

  describe '.current_term_local_ids' do
    let!(:pals) { TestPals.create! }
    let!(:time_now) { pals.time_now }

    it 'works at different times' do
      expect(SchoolYear.current_term_local_ids(time_now)).to eq  ['Q3', 'S2', '2', '9', 'FY']
      expect(SchoolYear.current_term_local_ids(DateTime.new(2018, 10, 2))).to eq  ['Q1', 'S1', '1', '9', 'FY']
      expect(SchoolYear.current_term_local_ids(DateTime.new(2018, 11, 21))).to eq  ['Q2', 'S1', '1', '9', 'FY']
      expect(SchoolYear.current_term_local_ids(DateTime.new(2019, 6, 26))).to eq  []
    end
  end
end
