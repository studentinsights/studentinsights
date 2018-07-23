require 'rails_helper'

RSpec.describe McasRow do

  context 'with no Assessment records in the database' do
    before { Assessment.seed_somerville_assessments }
    let(:student) { FactoryBot.create(:student) }

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

      it 'does not create a student assessment record and returns nil' do
        expect(McasRow.new(row, student.id, Assessment.all.to_a).build).to eq nil
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
        let!(:assessment) { Assessment.where(family: 'MCAS', subject: 'Mathematics').first }

        it 'returns a saveable student assessment record' do
          McasRow.new(row, student.id, Assessment.all.to_a).build.save!
          expect(StudentAssessment.count).to eq 1
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

      it 'returns a saveable student assessment record' do
        McasRow.new(row, student.id, Assessment.all.to_a).build.save!
        expect(StudentAssessment.count).to eq 1
      end
    end

    context 'Next Gen MCAS' do
      let(:row) {
        {
          assessment_test: 'MCAS',
          assessment_subject: 'Arts',
          assessment_name: 'MCAS 2016 English Language Arts',
          local_id: student.local_id,
          assessment_date: Date.today,
          assessment_scale_score: "550.0"
        }
      }

      before { McasRow.new(row, student.id, Assessment.all.to_a).build.save! }

      let(:student_assessment) { StudentAssessment.last }

      let(:assessment_family) { student_assessment.assessment.family }

      it 'assigns the correct "Next Gen" assessment family' do
        expect(assessment_family).to eq 'Next Gen MCAS'
      end
    end

  end
end
