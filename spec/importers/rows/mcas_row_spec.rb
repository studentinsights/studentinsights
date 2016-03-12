require 'rails_helper'

RSpec.describe McasRow do

  context 'with no Assessment records in the database' do
    before { Assessment.destroy_all }
    let(:student) { FactoryGirl.create(:student) }
    after { Assessment.seed_somerville_assessments }

    context 'invalid subject (i.e. not used in Student Insights)' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Technology',
          assessment_name: 'MCAS 2016 Technology',
          local_id: student.local_id,
          assessment_date: Date.today
        }
      }
      before { McasRow.build(row).save! }

      it 'does not blow up, does not create a student assessment record' do
        expect(StudentAssessment.count).to eq 0
      end
    end

    context 'MCAS Mathematics' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Mathematics',
          assessment_name: 'MCAS 2016 Mathematics',
          local_id: student.local_id,
          assessment_date: Date.today
        }
      }

      context 'when the Assessment family already exists' do
        let(:assessment) { Assessment.where(family: 'MCAS', subject: 'Mathematics').first }
        before { McasRow.build(row).save! }

        it 'creates a student assessment record' do
          expect(StudentAssessment.count).to eq 1
        end

        it 'does not create another Assessment record' do
          expect(Assessment.count).to eq 1
        end
      end

      context 'when the Assessment family does not yet exist' do
        before { McasRow.build(row).save! }

        it 'creates a student assessment record' do
          expect(StudentAssessment.count).to eq 1
        end

        it 'also creates an Assessment with family MCAS and subject Mathematics as a side effect' do
          expect(Assessment.count).to eq 1
          expect(Assessment.last.family).to eq 'MCAS'
          expect(Assessment.last.subject).to eq 'Mathematics'
        end
      end
    end

    context 'MCAS English Language Arts, when the ELA Assessment does not yet exist' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Arts',
          assessment_name: 'MCAS 2016 English Language Arts',
          local_id: student.local_id,
          assessment_date: Date.today
        }
      }
      before { McasRow.build(row).save! }

      it 'creates a student assessment record' do
        expect(StudentAssessment.count).to eq 1
      end

      it 'creates a new Assessment as a side-effect' do
        expect(Assessment.count).to eq 1
        expect(Assessment.last.subject).to eq 'ELA'

      end
    end
  end
end
