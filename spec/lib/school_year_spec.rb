require 'spec_helper'

RSpec.describe SchoolYear do
  describe '.to_school_year' do
    it 'works with JS Date objects' do
      expect(SchoolYear.to_school_year(moment.utc('2014-08-19').valueOf())).toEqual(2014);
      expect(SchoolYear.to_school_year(moment.utc('2013-09-12').valueOf())).toEqual(2013);
    end

    it 'works with Moment objects' do
      expect(SchoolYear.to_school_year(moment.utc('2014-11-19'))).toEqual(2014);
      expect(SchoolYear.to_school_year(moment.utc('2014-05-12'))).toEqual(2013);
    end
  end

  # describe '.firstDayOfSchool' do
  #   it 'works' do
  #     expect(firstDayOfSchool(2016).isSame(moment.utc("2016-08-15"))).toEqual(true);
  #     expect(firstDayOfSchool(2013).isSame(moment.utc("2013-08-15"))).toEqual(true);
  #   end
  # end

  # describe '.lastDayOfSchool' do
  #   it 'works' do
  #     expect(lastDayOfSchool(2016).isSame(moment.utc("2017-06-30"))).toEqual(true);
  #     expect(lastDayOfSchool(2013).isSame(moment.utc("2014-06-30"))).toEqual(true);
  #   end
  # end
end
