require 'rails_helper'

RSpec.describe DibelsRow do

  let(:student) { FactoryBot.create(:student) }
  let(:row) {
    { assessment_test: 'DIBELS', local_id: student.local_id, assessment_date: Date.today }
  }

  let(:assessment) { Assessment.last }
  before { DibelsRow.build(row, student.id).save! }

  it 'creates an assessment with family DIBELS and no subject' do
    expect(assessment.family).to eq 'DIBELS'
    expect(assessment.subject).to be_nil
  end

  it 'creates a student assessment result' do
    expect(StudentAssessment.count).to eq 1
  end

end
