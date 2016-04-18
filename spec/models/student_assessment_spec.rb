require 'rails_helper'

RSpec.describe StudentAssessment, type: :model do

  describe 'validation by student/assessment/date_taken' do
    let!(:student) { FactoryGirl.create(:student) }
    let!(:dibels) { FactoryGirl.create(:assessment, family: 'DIBELS') }
    let(:yesterday) { Time.now - 1.day }
    let(:day_before_yesterday) { Time.now - 2.days }

    context 'unique across the combination of student/assessment/date_taken' do
      before do
        FactoryGirl.create(:student_assessment, {
          assessment: dibels,
          performance_level: 'Strategic',
          date_taken: day_before_yesterday,
          student: student
        })
      end

      subject(:student_assessment) do
        FactoryGirl.build(:student_assessment, {
          assessment: dibels,
          performance_level: 'Strategic',
          date_taken: yesterday,
          student: student
        })
      end

      it 'is valid' do
        expect(subject).to be_valid
      end
    end
    context 'not unique across the combination of student/assessment/date_taken' do
      before do
        FactoryGirl.create(:student_assessment, {
          assessment: dibels,
          performance_level: 'Strategic',
          date_taken: yesterday,
          student: student
        })
      end

      subject(:student_assessment) do
        FactoryGirl.build(:student_assessment, {
          assessment: dibels,
          performance_level: 'Strategic',
          date_taken: yesterday,
          student: student
        })
      end

      it 'is not valid' do
        expect(subject).not_to be_valid
      end
    end
  end

  describe 'validates that DIBELS records have performance_level' do
    let!(:student) { FactoryGirl.create(:student) }
    let!(:yesterday) { Time.now - 1.day }
    let!(:dibels) { FactoryGirl.create(:assessment, family: 'DIBELS') }

    it 'cannot make DIBELS assessment with no performance_level' do
      student_assessment = StudentAssessment.create({
        :student_id =>  student.id,
        :assessment_id => dibels.id,
        :date_taken =>  yesterday,
        :scale_score => nil,
        :growth_percentile => nil,
        :performance_level => nil,
        :percentile_rank => nil,
        :instructional_reading_level => nil
      })
      expect(student_assessment).not_to be_valid
    end
  end

  describe '.by_family_and_subject' do
    let!(:student_assessment) { FactoryGirl.create(:mcas_math_advanced_assessment) }
    context 'MCAS & math' do
      context 'there are only MCAS math student assessments' do
        it 'returns the MCAS and math student assessments' do
          expect(StudentAssessment.by_family_and_subject("MCAS", "Mathematics")).to eq([student_assessment])
        end
      end
      context 'there are no MCAS math student assessments' do
        it 'returns an empty association' do
          expect(StudentAssessment.by_family_and_subject("MCAS", "Reading")).to be_empty
        end
      end
    end
  end

  describe '.by_family' do
    context 'ACCESS' do
      context 'there are only ACCESS student assessments' do
        let!(:access_student_assessment) { FactoryGirl.create(:access) }
        it 'returns the ACCESS student assessments' do
          expect(StudentAssessment.by_family("ACCESS")).to eq([access_student_assessment])
        end
      end
      context 'there are no ACCESS student assessments' do
        let!(:dibels_student_assessment) { FactoryGirl.create(:dibels_with_performance_level) }
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
