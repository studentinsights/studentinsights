require 'rails_helper'

RSpec.describe StudentAssessment, type: :model do

  describe 'validation by student/assessment/date_taken' do
    let!(:student) { FactoryBot.create(:student) }
    let!(:dibels) { FactoryBot.create(:assessment, family: 'DIBELS') }
    let(:yesterday) { Time.now - 1.day }
    let(:day_before_yesterday) { Time.now - 2.days }

    context 'unique across the combination of student/assessment/date_taken' do
      before {
        FactoryBot.create(
          :student_assessment, assessment: dibels, date_taken: day_before_yesterday, student: student
        )
      }

      subject(:student_assessment) {
        FactoryBot.build(
          :student_assessment, assessment: dibels, date_taken: yesterday, student: student
        )
      }

      it 'is valid' do
        expect(subject).to be_valid
      end
    end
    context 'not unique across the combination of student/assessment/date_taken' do
      before {
        FactoryBot.create(
          :student_assessment, assessment: dibels, date_taken: yesterday, student: student
        )
      }

      subject(:student_assessment) {
        FactoryBot.build(
          :student_assessment, assessment: dibels, date_taken: yesterday, student: student
        )
      }

      it 'is not valid' do
        expect(subject).not_to be_valid
      end
    end
  end

  describe '.by_family_and_subject' do
    let!(:student_assessment) { FactoryBot.create(:student_assessment, assessment: assessment) }
    context 'MCAS & math' do
      let(:result) { StudentAssessment.by_family_and_subject("MCAS", "Mathematics") }
      context 'there are only MCAS math student assessments' do
        let(:assessment) { FactoryBot.create(:assessment, :mcas, :math) }
        it 'returns the MCAS and math student assessments' do
          expect(result).to eq([student_assessment])
        end
      end
      context 'there are MCAS reading student assessments' do
        let(:assessment) { FactoryBot.create(:assessment, :mcas, :ela) }
        it 'returns an empty association' do
          expect(result).to be_empty
        end
      end
    end
  end

  describe '.by_family' do
    context 'ACCESS' do
      context 'there are only ACCESS student assessments' do
        let(:assessment) { FactoryBot.create(:assessment, :access) }
        let(:student_assessment) { FactoryBot.create(:student_assessment, assessment: assessment) }
        it 'returns the ACCESS student assessments' do
          expect(StudentAssessment.by_family("ACCESS")).to eq([student_assessment])
        end
      end
      context 'there are no ACCESS student assessments' do
        let(:assessment) { FactoryBot.create(:assessment, :star, :math) }
        it 'returns an empty association' do
          expect(StudentAssessment.by_family("ACCESS")).to be_empty
        end
      end
    end
  end
end
