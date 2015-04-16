RSpec.describe StudentResultPresenter do

  let(:student_result_without_math) { FactoryGirl.create(:student_result_without_math) }
  let(:student_result_without_ela) { FactoryGirl.create(:student_result_without_ela) }
  let(:student_result_with_both) { FactoryGirl.create(:student_result_high) }

  describe '#math_performance' do
    context 'has no math result' do
      it 'presents N/A' do
        presenter = StudentResultPresenter.new(student_result_without_math)
        expect(presenter.math_performance).to eq "N/A"
      end
    end
    context 'has a math result' do
      it 'presents the math performance result' do
        presenter = StudentResultPresenter.new(student_result_with_both)
        expect(presenter.math_performance).to eq student_result_with_both.math_performance
      end
    end
  end
  describe '#ela_growth' do
    context 'has no ela result' do
      it 'presents N/A' do
        presenter = StudentResultPresenter.new(student_result_without_ela)
        expect(presenter.ela_growth).to eq "N/A"
      end
    end
    context 'has an ela result' do
      it 'presents the ela growth result' do
        presenter = StudentResultPresenter.new(student_result_with_both)
        expect(presenter.ela_growth).to eq student_result_with_both.ela_growth
      end
    end
  end
end
