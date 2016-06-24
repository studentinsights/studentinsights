require 'rails_helper'

RSpec.describe StudentAssessment, type: :model do

  describe 'validation by student/assessment/date_taken' do
    let!(:student) { FactoryGirl.create(:student) }
    let!(:dibels) { FactoryGirl.create(:assessment, family: 'DIBELS') }
    let(:yesterday) { Time.now - 1.day }
    let(:day_before_yesterday) { Time.now - 2.days }

    context 'unique across the combination of student/assessment/date_taken' do
      before {
        FactoryGirl.create(:student_assessment,
          assessment: dibels,
          date_taken: day_before_yesterday,
          student: student,
          performance_level: 'DECENT',
        )
      }

      subject(:student_assessment) {
        FactoryGirl.build(:student_assessment,
          assessment: dibels,
          date_taken: yesterday,
          student: student,
          performance_level: 'DECENT',
        )
      }

      it 'is valid' do
        expect(subject).to be_valid
      end
    end

    context 'not unique across the combination of student/assessment/date_taken' do
      before {
        FactoryGirl.create(:student_assessment,
          assessment: dibels,
          date_taken: yesterday,
          student: student,
          performance_level: 'DECENT',
        )
      }

      subject(:student_assessment) {
        FactoryGirl.build(:student_assessment,
          assessment: dibels,
          date_taken: yesterday,
          student: student,
          performance_level: 'DECENT',
        )
      }

      it 'is not valid' do
        expect(subject).not_to be_valid
      end
    end
  end

  describe '.by_family_and_subject' do
    let!(:student_assessment) {
      FactoryGirl.create(:student_assessment,
        assessment: assessment,
        scale_score: rand(0..300),
        growth_percentile: rand(0..100),
        performance_level: ['A', 'W']
      )
    }
    context 'MCAS & math' do
      let(:result) { StudentAssessment.by_family_and_subject("MCAS", "Mathematics") }
      context 'there are only MCAS math student assessments' do
        let(:assessment) { FactoryGirl.create(:assessment, :mcas, :math) }
        it 'returns the MCAS and math student assessments' do
          expect(result).to eq([student_assessment])
        end
      end
      context 'there are MCAS reading student assessments' do
        let(:assessment) { FactoryGirl.create(:assessment, :mcas, :ela) }
        it 'returns an empty association' do
          expect(result).to be_empty
        end
      end
    end
  end

  describe '.by_family' do
    let!(:student_assessment) {
      FactoryGirl.create(:student_assessment, assessment: assessment, percentile_rank: 2)
    }
    context 'ACCESS' do
      context 'there are only ACCESS student assessments' do
        let(:assessment) { FactoryGirl.create(:assessment, :access) }
        it 'returns the ACCESS student assessments' do
          expect(StudentAssessment.by_family("ACCESS")).to eq([student_assessment])
        end
      end
      context 'there are no ACCESS student assessments' do
        let(:assessment) { FactoryGirl.create(:assessment, :star, :math) }
        it 'returns an empty association' do
          expect(StudentAssessment.by_family("ACCESS")).to be_empty
        end
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
      let(:student_assessment) { FactoryGirl.build(:student_assessment, date_taken: nil) }
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
