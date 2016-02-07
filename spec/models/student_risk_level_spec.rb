require 'rails_helper'

RSpec.describe StudentRiskLevel, type: :model do

  describe '#risk_level' do

    context 'missing MCAS and STAR results' do
      context 'not limited English' do
        let(:student) { FactoryGirl.create(:student) }
        let(:student_risk_level) { StudentRiskLevel.create!(student: student) }
        it 'has Risk Level of nil' do
          expect(student_risk_level.level).to eq nil
        end
      end

      context 'limited english' do
        let(:student) { FactoryGirl.create(:limited_english_student) }
        let(:student_risk_level) { StudentRiskLevel.create!(student: student) }
        it 'has Risk Level 3' do
          expect(student_risk_level.level).to eq 3
        end
      end
    end

    context 'has MCAS results but not STAR' do
      context 'has MCAS math but not MCAS ela' do
        context 'has a W value for MCAS math' do
          let(:student) { FactoryGirl.create(:student_with_mcas_math_warning_assessment) }
          let!(:student_risk_level) { StudentRiskLevel.create!(student: student) }
          it 'has risk level 3' do
            expect(student_risk_level.level).to eq 3
          end
        end
      end
    end

    context 'has STAR results but not MCAS' do
      context 'has STAR math but not STAR reading' do
        context 'STAR math is between 30 and 85' do
          let(:student) { FactoryGirl.create(:student_with_star_assessment_between_30_85) }
          let!(:student_risk_level) { StudentRiskLevel.create!(student: student) }
          it 'has Risk Level 1' do
            expect(student_risk_level.level).to eq 1
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
      end
    end

  end
end
