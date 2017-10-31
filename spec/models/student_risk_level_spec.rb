require 'rails_helper'

RSpec.describe StudentRiskLevel, type: :model do

  describe '#update_risk_level!' do
    context 'when no school' do
      let(:student) { FactoryGirl.create(:student, school: nil) }
      it 'does not raise' do
        expect { student_risk_level.update_risk_level! }.to_not raise_error
      end
    end
  end

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

  let(:student_risk_level) { StudentRiskLevel.create!(student: student) }

  describe '#level_as_string' do

    context 'no assessment results, not limited English' do
      let(:student) { FactoryGirl.create(:student) }
      it 'returns "N/A"' do
        expect(student_risk_level.level_as_string).to eq "N/A"
      end
    end

    context 'Limited English Proficiency' do
      let(:student) { FactoryGirl.create(:limited_english_student) }
      it 'returns "3"' do
        expect(student_risk_level.level_as_string).to eq "3"
      end
    end

  end

  describe '#css_class_name' do

    context 'no assessment results, not limited English' do
      let(:student) { FactoryGirl.create(:student) }
      it 'returns "N/A"' do
        expect(student_risk_level.css_class_name).to eq "risk-na"
      end
    end

    context 'Limited English Proficiency' do
      let(:student) { FactoryGirl.create(:limited_english_student) }
      it 'returns "3"' do
        expect(student_risk_level.css_class_name).to eq "risk-3"
      end
    end

  end

  describe '#explanation' do

    context 'missing MCAS and STAR results' do
      context 'not limited English' do
        let(:student) { FactoryGirl.create(:student) }
        let(:student_risk_level) { StudentRiskLevel.create!(student: student) }
        it 'has an explanation' do
          expect(student_risk_level.explanation).to eq({
            intro: "This student is at Risk N/A because:",
            reasons: ["There is not enough information to tell."]
          })
        end
      end

      context 'limited english' do
        let(:student) { FactoryGirl.create(:limited_english_student) }
        let(:student_risk_level) { StudentRiskLevel.create!(student: student) }
        it 'has a correct explanation' do
          expect(student_risk_level.explanation).to eq({
            intro: "This student is at Risk 3 because:",
            reasons: ["This student is limited English proficient."]
          })
        end
      end
    end

    context 'has MCAS results but not STAR' do
      context 'has MCAS math but not MCAS ela' do
        context 'has a W value for MCAS math' do
          let(:student) { FactoryGirl.create(:student_with_mcas_math_warning_assessment) }
          let!(:student_risk_level) { StudentRiskLevel.create!(student: student) }
          it 'has a correct explanation' do
            expect(student_risk_level.explanation).to eq({
              intro: "This student is at Risk 3 because:",
              reasons: ["This student's MCAS Math performance level is Warning / Not Meeting Expectations."]
            })
          end
        end
      end
    end

    context 'has Next Gen MCAS and MCAS, not STAR' do
      context 'has Next Gen MCAS math and MCAS math' do
        context 'has a W value for MCAS math and an EE for Next Gen MCAS Math' do
          let(:student) { FactoryGirl.create(:student) }
          let(:next_gen_mcas_math_ee) {FactoryGirl.create(:next_gen_mcas_math_exceeds_expectations_assessment, student: student)}
          let(:mcas_math_w) {FactoryGirl.create(:mcas_math_warning_assessment, student: student)}
          let!(:student_risk_level) { StudentRiskLevel.create!(student: student) }
          it 'has a correct explanation' do
            expect(student_risk_level.explanation).to eq({
              intro: "This student is at Risk N/A because:",
              reasons: ["There is not enough information to tell."]
            })
          end
        end
      end
    end

    context 'has STAR results but not MCAS' do
      context 'has STAR math but not STAR reading' do
        context 'STAR math is between 30 and 85' do
          let(:student) { FactoryGirl.create(:student_with_star_assessment_between_30_85) }
          let!(:student_risk_level) { StudentRiskLevel.create!(student: student) }
          it 'has a correct explanation' do
            expect(student_risk_level.explanation).to eq({
              intro: "This student is at Risk 1 because:",
              reasons: ["This student's STAR Math performance is above 30."]
            })
          end
        end
      end
    end

    context 'has both MCAS and STAR results' do
      context 'MCAS is advanced but STAR is warning' do
        let(:student) { FactoryGirl.create(:student_with_mcas_math_advanced_and_star_math_warning_assessments) }
        let!(:student_risk_level) { StudentRiskLevel.create!(student: student) }
        it 'has a correct explanation' do
          expect(student_risk_level.explanation).to eq({
            intro: "This student is at Risk 3 because:",
            reasons: [
              "This student's STAR Math performance is in the warning range (below 10)."
            ]
          })
        end
      end
    end

  end

end
