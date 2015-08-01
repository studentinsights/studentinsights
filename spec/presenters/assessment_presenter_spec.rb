require 'rails_helper'

RSpec.describe AssessmentPresenter do

  describe '#performance_level' do
    context 'assessment has no performance level' do
      let(:assessment) { FactoryGirl.create(:mcas_math_assessment) }
      let(:presenter) { AssessmentPresenter.new(assessment) }
      it 'presents "—"' do
        expect(presenter.performance_level).to eq "—"
      end
    end
    context 'assessment has a performance level' do
      let(:assessment) { FactoryGirl.create(:mcas_math_warning_assessment) }
      let(:presenter) { AssessmentPresenter.new(assessment) }
      it 'delegates the display to the assessment' do
        expect(presenter.performance_level).to eq "W"
      end
    end
  end

end
