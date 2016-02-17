require 'rails_helper'

RSpec.describe X2AssessmentRow do

  let(:student) { FactoryGirl.create(:student) }
  before { X2AssessmentRow.build(row).save! }
  let(:assessment) { Assessment.last }

  context 'DIBELS' do
    let(:row) {
      { assessment_test: 'DIBELS', local_id: student.local_id, assessment_date: Date.today }
    }

    it 'creates an assessment with family DIBELS and no subject' do
      expect(assessment.family).to eq 'DIBELS'
      expect(assessment.subject).to be_nil
    end
  end

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
  end


end
