require 'rails_helper'

describe RiskAnalyzer do 

  let!(:high_risk_student) { FactoryGirl.create(:high_risk_student) }
  let!(:medium_risk_student) { FactoryGirl.create(:medium_risk_student) }
  let!(:low_risk_student) { FactoryGirl.create(:low_risk_student) }

  describe 'high_risk' do
    context 'scope includes high risk students' do
      let(:analyzer) { RiskAnalyzer.new([high_risk_student, medium_risk_student, low_risk_student]) }
      it 'returns the high risk students' do
        expect(analyzer.high_risk).to include high_risk_student
      end
      it 'does not return medium risk students' do
        expect(analyzer.high_risk).not_to include medium_risk_student
      end
    end
    context 'scope does not include high risk students' do
      let(:analyzer) { RiskAnalyzer.new([medium_risk_student]) }
      it 'returns an empty array' do
        expect(analyzer.high_risk).to eq []
      end
    end
  end

  describe 'medium_risk' do
    context 'scope includes medium students' do
      let(:analyzer) { RiskAnalyzer.new([high_risk_student, medium_risk_student, low_risk_student]) }
      it 'returns the medium risk students' do
        expect(analyzer.medium_risk).to include medium_risk_student
      end
      it 'does not return high risk students' do
        expect(analyzer.medium_risk).not_to include high_risk_student
      end
    end
    context 'scope does not include medium risk students' do
      let(:analyzer) { RiskAnalyzer.new([high_risk_student, low_risk_student]) }
      it 'returns an empty array' do
        expect(analyzer.medium_risk).to eq []
      end
    end
  end

  describe 'low_risk' do
    context 'scope includes students' do
      let(:analyzer) { RiskAnalyzer.new([high_risk_student, medium_risk_student, low_risk_student]) }
      it 'returns the low risk students' do
        expect(analyzer.low_risk).to include low_risk_student
      end
      it 'does not return high risk students' do
        expect(analyzer.low_risk).not_to include high_risk_student
      end
    end
    context 'scope does not include low risk students' do
      let(:analyzer) { RiskAnalyzer.new([high_risk_student]) }
      it 'returns an empty array' do
        expect(analyzer.low_risk).to eq []
      end
    end
  end

  describe 'by_category' do
    let(:analyzer) { RiskAnalyzer.new([high_risk_student, medium_risk_student, low_risk_student]) }
    it 'assigns correct students to each category' do
      expect(analyzer.by_category).to eq(
        { "High" => [high_risk_student], "Medium" => [medium_risk_student], "Low" => [low_risk_student] }
      )
    end
  end
end