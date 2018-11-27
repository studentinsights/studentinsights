require 'rails_helper'

RSpec.describe DisciplineIncident do
  let!(:student) { FactoryBot.create(:student) }

  def create_incident
    DisciplineIncident.create!(
      incident_code: 'Bullying',
      occurred_at: Time.now,
      student: student
    )
  end

  it { expect(create_incident.valid?).to eq true }
end
