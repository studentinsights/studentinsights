require 'rails_helper'

RSpec.describe McasRow do

  let(:student) { FactoryGirl.create(:student) }
  before { McasRow.build(row).save! }
  let(:assessment) { Assessment.last }

  context 'MCAS Mathematics' do
    let(:row) {
      {
        assessment_test: 'MCAS',
        assessment_subject: 'Mathematics',
        local_id: student.local_id,
        assessment_date: Date.today
      }
    }

    it 'creates an assessment with family MCAS and subject Mathematics' do
      expect(assessment.family).to eq 'MCAS'
      expect(assessment.subject).to eq 'Mathematics'
    end

    it 'creates a student assessment result' do
      expect(StudentAssessment.count).to eq 1
    end

  end

  context 'MCAS Arts' do
    let(:row) {
      {
        assessment_test: 'MCAS',
        assessment_subject: 'Arts',
        local_id: student.local_id,
        assessment_date: Date.today
      }
    }

    it 'does not create an assessment or student assessment result' do
      expect(Assessment.count).to eq 0
      expect(StudentAssessment.count).to eq 0
    end
  end

end
