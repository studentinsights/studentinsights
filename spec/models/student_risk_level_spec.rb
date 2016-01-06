require 'rails_helper'

RSpec.describe StudentRiskLevel, type: :model do

  describe '#risk_level' do

    context 'missing MCAS and STAR results' do
      context 'not limited English' do
        let(:student) { FactoryGirl.create(:student) }
        let(:student_risk_level) { StudentRiskLevel.create!(student_id: student.id) }
        it 'has Risk Level of nil' do
          expect(student_risk_level.level).to eq nil
        end
        it 'has an explanation' do
          expect(student_risk_level.explanation).to eq "This student is at Risk N/A because:<br/><br/><ul><li>There is not enough information to tell.</li></ul>"
        end
      end

      context 'limited english' do
        let(:student) { FactoryGirl.create(:limited_english_student) }
        let(:student_risk_level) { StudentRiskLevel.create!(student_id: student.id) }
        it 'has Risk Level 3' do
          expect(student_risk_level.level).to eq 3
        end
        it 'has a correct explanation' do
          expect(student_risk_level.explanation).to eq "This student is at Risk 3 because:<br/><br/><ul><li>This student is limited English proficient.</li></ul>"
        end
      end
    end

    context 'has MCAS results but not STAR' do
      context 'has MCAS math but not MCAS ela' do
        context 'has a W value for MCAS math' do
          let(:student) { FactoryGirl.create(:student_with_mcas_math_warning_assessment) }
          let!(:student_risk_level) { StudentRiskLevel.create!(student_id: student.id) }
          it 'has risk level 3' do
            expect(student_risk_level.level).to eq 3
          end
          it 'has a correct explanation' do
            correct_explanation = "This student is at Risk 3 because:<br/><br/><ul><li>This student's MCAS Math performance level is Warning.</li></ul>"
            expect(student_risk_level.explanation).to eq correct_explanation
          end
        end
      end
    end

    context 'has STAR results but not MCAS' do
      context 'has STAR math but not STAR reading' do
        context 'STAR math is between 30 and 85' do
          let(:student) { FactoryGirl.create(:student_with_star_assessment_between_30_85) }
          let!(:student_risk_level) { StudentRiskLevel.create!(student_id: student.id) }
          it 'has Risk Level 1' do
            expect(student_risk_level.level).to eq 1
          end
          it 'has a correct explanation' do
            correct_explanation = "This student is at Risk 1 because:<br/><br/><ul><li>This student's STAR Math performance is above 30.</li></ul>"
            expect(student_risk_level.explanation).to eq correct_explanation
          end
        end
      end
    end

    context 'has both MCAS and STAR results' do
      context 'MCAS is advanced but STAR is warning' do
        let(:student) { FactoryGirl.create(:student_with_mcas_math_advanced_and_star_math_warning_assessments) }
        let!(:student_risk_level) { StudentRiskLevel.create!(student_id: student.id) }
        it 'has Risk Level 3' do
          expect(student_risk_level.level).to eq 3
        end
        it 'has a correct explanation' do
          correct_explanation = "This student is at Risk 3 because:<br/><br/><ul><li>This student's STAR Math performance is in the warning range (below 10).</li></ul>"
          expect(student_risk_level.explanation).to eq correct_explanation
        end
      end
    end
  end
end
