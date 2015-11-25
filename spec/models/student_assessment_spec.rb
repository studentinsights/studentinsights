require 'rails_helper'

RSpec.describe StudentAssessment, :type => :model do
  describe '.latest' do
    let!(:first_assessment) { FactoryGirl.create(:student_assessment, date_taken: 3.years.ago) }
    let!(:last_assessment) { FactoryGirl.create(:student_assessment, date_taken: 1.year.ago) }

    it 'orders student assessment by date taken' do
      expect(StudentAssessment.latest).to eq([last_assessment, first_assessment])
    end
  end

  describe '.first_or_missing' do
    context 'when there are student assessments' do
      let!(:assessment) { FactoryGirl.create(:student_assessment) }
      it 'returns the first one' do
        expect(StudentAssessment.first_or_missing).to eq assessment
      end
    end
    context 'when there are no student assessments' do
      it 'returns a MissingStudentAssessment' do
        expect(StudentAssessment.first_or_missing).to be_a MissingStudentAssessment
      end
    end
  end

  describe '.mcas_math' do
    let!(:student_assessment) { FactoryGirl.create(:student_assessment, assessment: assessment) }

    context 'there are only MCAS math student assessments' do
      let(:assessment) { FactoryGirl.create(:assessment, :mcas, :math) }

      it 'returns the MCAS and math student assessments' do
        expect(StudentAssessment.mcas_math).to eq([student_assessment])
      end
    end
    context 'there are no MCAS math student assessments' do
      let(:assessment) { FactoryGirl.create(:assessment, :mcas, :reading) }

      it 'returns an empty association' do
        expect(StudentAssessment.mcas_math).to be_empty
      end
    end
  end

  describe '#assign_to_school_year' do
    context 'has date taken' do
      let(:student_assessment) { FactoryGirl.create(:student_assessment) }
      it 'assigns the school year correctly' do
        expect(student_assessment.school_year).to eq(SchoolYear.find_by_name("2014-2015"))
      end
    end
    context 'does not have date taken' do
      let(:student_assessment) { FactoryGirl.build(:student_assessment_without_date_taken) }
      it 'is invalid' do
        expect(student_assessment).not_to be_valid
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
