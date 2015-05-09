RSpec.describe StarResultPresenter do

  let(:star_result_without_math) { FactoryGirl.create(:star_result_without_math) }
  let(:star_result_with_math) { FactoryGirl.create(:star_result_with_math) }

  describe '#math_percentile_rank' do
    context 'has no math result' do
      it 'presents "—"' do
        presenter = StarResultPresenter.new(star_result_without_math)
        expect(presenter.math_percentile_rank).to eq "—"
      end
    end
    context 'has a math result' do
      it 'presents correct percentile' do
        presenter = StarResultPresenter.new(star_result_with_math)
        expect(presenter.math_percentile_rank).to eq star_result_with_math.math_percentile_rank
      end
    end
  end
end
