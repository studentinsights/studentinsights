require 'rails_helper'

RSpec.describe StudentAssessment, :type => :model do
  describe '#assign_to_school_year' do
    context 'has date taken' do
      let(:student_assessment) { FactoryGirl.create(:student_assessment) }
      it 'assigns the school year correctly' do
        expect(student_assessment.school_year).to eq(SchoolYear.find_by_name("2014-2015"))
      end
    end
    context 'does not have date taken' do
      let(:student_assessment) { FactoryGirl.create(:student_assessment_without_date_taken) }
      it 'raises an error' do
        expect { student_assessment.save }.to raise_error NoMethodError
      end
    end
  end
  describe '#risk_level' do
    context 'does not belong to an assessment family' do
      let(:student_assessment) { FactoryGirl.create(:student_assessment) }
      it 'returns nil' do
        expect(student_assessment.risk_level).to be nil
      end
    end
  end
end
