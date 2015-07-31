require 'rails_helper'

RSpec.describe Assessment, :type => :model do
  describe '#assign_to_school_year' do
    context 'has date taken' do
      let(:mcas_result) { FactoryGirl.create(:mcas_result) }
      it 'assigns the school year correctly' do
        expect(mcas_result.school_year).to eq(SchoolYear.find_by_name("2014-2015"))
      end
    end
    context 'does not have date taken' do
      let(:mcas_result) { FactoryGirl.create(:mcas_result_without_date_taken) }
      it 'raises an error' do
        expect { mcas_result.save }.to raise_error NoMethodError
      end
    end
  end
  describe '#math_performance_warning?' do
    context 'MCAS result with math and ela warning' do
      let(:result) { FactoryGirl.create(:mcas_result_low) }
      it 'returns a math warning' do
        expect(result.math_performance_warning?).to be true
      end
      it 'returns an english language arts warning' do
        expect(result.ela_performance_warning?).to be true
      end
    end
    context 'MCAS result with without warnings' do
      let(:result) { FactoryGirl.create(:mcas_result_high) }
      it 'does not return warning' do
        expect(result.math_performance_warning?).to be false
        expect(result.ela_performance_warning?).to be false
      end
    end
  end
end
