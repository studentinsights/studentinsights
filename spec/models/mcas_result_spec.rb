RSpec.describe McasResult, :type => :model do

  describe '#math_performance_warning?' do

    context 'low result' do
      it 'returns a warning' do
        result = FactoryGirl.create(:mcas_result_low)
        expect(result.math_performance_warning?).to be true
      end
    end

    context 'high result' do
      it 'does not return warning' do
        result = FactoryGirl.create(:mcas_result_high)
        expect(result.math_performance_warning?).to be false
      end
    end
  end

  describe '#ela_growth_warning?' do

    context 'low result' do
      it 'returns a warning' do
        result = FactoryGirl.create(:mcas_result_low)
        expect(result.ela_growth_warning?).to be true
      end
    end

    context 'high result' do
      it 'does not return warning' do
        result = FactoryGirl.create(:mcas_result_high)
        expect(result.ela_growth_warning?).to be false
      end
    end
  end
end
