require 'rails_helper'

describe StudentAssessmentDecorator do

  describe '#performance_level' do

    context 'assessment has no performance level' do
      let(:decorated_student_assessment) {
        FactoryGirl.build(:mcas_math_assessment, performance_level: nil).decorate
      }

      it 'presents "—"' do
        expect(decorated_student_assessment.performance_level).to eq "—"
      end
    end

    context 'assessment has a performance level' do
      let(:decorated_student_assessment) {
        FactoryGirl.build(:mcas_math_warning_assessment).decorate
      }

      it 'delegates the display to the assessment' do
        expect(decorated_student_assessment.performance_level).to eq "W"
      end
    end
  end

end
