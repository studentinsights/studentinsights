require 'rails_helper'

RSpec.describe do
  describe '#risk_level' do
    context 'missing MCAS and STAR results' do
      context 'not limited English' do
        let(:student) { FactoryGirl.create(:student) }
        let(:student_risk_level) { StudentRiskLevel.new(student).level }
        let(:presenter) { StudentRiskLevelPresenter.new(student_risk_level) }
        it 'has Risk Level string of "N/A"' do
          expect(presenter.level_as_string).to eq "N/A"
        end
        it 'has Risk Level presenter class name of "risk-na"' do
          expect(presenter.css_class_name).to eq "risk-na"
        end
      end
      context 'limited english' do
        let(:student) { FactoryGirl.create(:limited_english_student) }
        let(:student_risk_level) { StudentRiskLevel.new(student).level }
        let(:presenter) { StudentRiskLevelPresenter.new(student_risk_level) }
        it 'has Risk Level string of "3"' do
          expect(presenter.level_as_string).to eq "3"
        end
        it 'has Risk Level CSS class name of "risk-3"' do
          expect(presenter.css_class_name).to eq "risk-3"
        end
      end
    end
  end
end
