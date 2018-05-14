require 'rails_helper'

RSpec.describe DisciplineIncident do
  let!(:student) { FactoryBot.create(:student) }

  subject(:incident) {
    DisciplineIncident.create!(
      incident_code: 'Bullying',
      occurred_at: Time.now,
      student: student
    )
  }

  it { is_expected.to belong_to :student }
  it { is_expected.to validate_presence_of :student }
  it { is_expected.to validate_presence_of :occurred_at }
end
