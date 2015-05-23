require 'rails_helper'

RSpec.describe SchoolYear do
  describe '#in_between' do
    context 'current school year is same as first school year' do
      let!(:current_school_year) { FactoryGirl.create(:current_school_year) }
      let!(:first_school_year) { current_school_year }
      it 'returns array with current school year' do
        in_between = SchoolYear.in_between(first_school_year, current_school_year)
        expect(in_between).to eq([current_school_year])
      end
    end
    context 'current school year is year after first school year' do
      let!(:current_school_year) { FactoryGirl.create(:current_school_year) }
      let!(:first_school_year) { FactoryGirl.create(:last_school_year) }
      it 'returns array with first school year and current school year' do
        in_between = SchoolYear.in_between(first_school_year, current_school_year)
        expect(in_between).to eq([first_school_year, current_school_year])
      end
    end
    context 'current school year is two years after first school year' do
      let!(:current_school_year) { FactoryGirl.create(:current_school_year) }
      let!(:in_between_school_year) { FactoryGirl.create(:last_school_year) }
      let!(:first_school_year) { FactoryGirl.create(:two_school_years_ago) }
      it 'returns array with first school year, in between year, and current school year' do
        in_between = SchoolYear.in_between(first_school_year, current_school_year)
        expect(in_between).to eq(
          [first_school_year, in_between_school_year, current_school_year]
        )
      end
    end
  end
end
