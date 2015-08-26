require 'rails_helper'

RSpec.describe McasValuePresenter do
  describe '#performance_level' do
    let(:presenter) { McasValuePresenter.new(student_assessment) }
    context 'student assessment missing' do
      let(:student_assessment) { nil }
      it 'returns a dash' do
        expect(presenter.performance_level).to eq '—'
      end
    end
    context 'student assessment not missing' do
      context 'performance_level missing' do
        let(:student_assessment) { { 'growth_percentile' => 12 } }
        it 'returns a dash' do
          expect(presenter.performance_level).to eq '—'
        end
      end
      context 'performance_level equals W' do
        let(:student_assessment) { { 'performance_level' => 'W' } }
        it 'returns a warning' do
          expect(presenter.performance_level).to eq "<div class='warning-text'>W</div>"
        end
      end
      context 'performance_level equals NI' do
        let(:student_assessment) { { 'performance_level' => 'NI' } }
        it 'does not return a warning' do
          expect(presenter.performance_level).to eq 'NI'
        end
      end
    end
  end
end
