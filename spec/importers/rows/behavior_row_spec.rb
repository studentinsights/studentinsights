require 'rails_helper'

RSpec.describe BehaviorRow do

  let!(:student) { FactoryBot.create(:student) }

  let(:data) do
    {
      local_id: student.local_id,
      incident_code: 'Bullying',
      incident_location: 'Classroom',
      incident_description: 'foo description',
      event_date: DateTime.parse('1981-12-30'),
    }
  end

  subject(:row) { BehaviorRow.new(data) }

  describe '#build' do
    it 'records a discipline incident' do
      expect { row.build.save! }.to change(DisciplineIncident, :count).by(1)
    end
  end
end
