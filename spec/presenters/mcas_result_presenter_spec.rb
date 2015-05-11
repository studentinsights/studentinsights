RSpec.describe McasResultPresenter do

  let(:mcas_result_without_math) { FactoryGirl.create(:mcas_result_without_math) }
  let(:mcas_result_without_ela) { FactoryGirl.create(:mcas_result_without_ela) }
  let(:mcas_result_with_both) { FactoryGirl.create(:mcas_result_high) }

  describe '#math_performance' do
    context 'has no math result' do
      it 'presents "—"' do
        presenter = McasResultPresenter.new(mcas_result_without_math)
        expect(presenter.math_performance).to eq "—"
      end
    end
    context 'has a math result' do
      it 'presents the math performance result' do
        presenter = McasResultPresenter.new(mcas_result_with_both)
        expect(presenter.math_performance).to eq mcas_result_with_both.math_performance
      end
    end
  end
  describe '#ela_growth' do
    context 'has no ela result' do
      it 'presents "—"' do
        presenter = McasResultPresenter.new(mcas_result_without_ela)
        expect(presenter.ela_growth).to eq "—"
      end
    end
    context 'has an ela result' do
      it 'presents the ela growth result' do
        presenter = McasResultPresenter.new(mcas_result_with_both)
        expect(presenter.ela_growth).to eq mcas_result_with_both.ela_growth
      end
    end
  end
end
