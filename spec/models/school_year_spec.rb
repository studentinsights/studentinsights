require 'rails_helper'

RSpec.describe SchoolYear do
  describe '#in_between' do
    context 'current school year is same as first school year' do
      let!(:current_school_year) { FactoryGirl.create(:sy_2014_2015) }
      let!(:first_school_year) { current_school_year }
      it 'returns array with current school year' do
        in_between = SchoolYear.in_between(first_school_year, current_school_year)
        expect(in_between).to eq([current_school_year])
      end
    end
    context 'current school year is year after first school year' do
      let!(:current_school_year) { FactoryGirl.create(:sy_2014_2015) }
      let!(:first_school_year) { FactoryGirl.create(:sy_2013_2014) }
      it 'returns array with first school year and current school year' do
        in_between = SchoolYear.in_between(first_school_year, current_school_year)
        expect(in_between).to eq([first_school_year, current_school_year])
      end
    end
    context 'current school year is two years after first school year' do
      let!(:current_school_year) { FactoryGirl.create(:sy_2014_2015) }
      let!(:in_between_school_year) { FactoryGirl.create(:sy_2013_2014) }
      let!(:first_school_year) { FactoryGirl.create(:sy_2012_2013) }
      it 'returns array with first school year, in between year, and current school year' do
        in_between = SchoolYear.in_between(first_school_year, current_school_year)
        expect(in_between).to eq(
          [first_school_year, in_between_school_year, current_school_year]
        )
      end
    end
  end
end
