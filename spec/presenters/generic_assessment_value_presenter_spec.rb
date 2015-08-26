require 'rails_helper'

RSpec.describe GenericAssessmentValuePresenter do
  describe '#scale_score' do
    let(:presenter) { GenericAssessmentValuePresenter.new(student_assessment) }
    context 'student assessment missing' do
      let(:student_assessment) { nil }
      it 'returns a dash' do
        expect(presenter.scale_score).to eq '—'
      end
    end
    context 'student assessment not missing' do
      context 'scale score missing' do
        let(:student_assessment) { { 'growth_percentile' => 12 } }
        it 'returns a dash' do
          expect(presenter.scale_score).to eq '—'
        end
      end
      context 'scale score equals 12' do
        let(:student_assessment) { { 'scale_score' => '12' } }
        it 'returns the value' do
          expect(presenter.scale_score).to eq '12'
        end
      end
    end
  end
end
