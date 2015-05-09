require 'rails_helper'

RSpec.describe McasResult, :type => :model do

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
