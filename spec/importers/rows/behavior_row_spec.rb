require 'rails_helper'

RSpec.describe BehaviorRow do

  let!(:student) { FactoryGirl.create(:student) }

  let(:data) do
    {
      local_id: student.local_id,
      event_date: DateTime.parse('1981-12-30'),
    }
  end

  subject(:row) { BehaviorRow.new(data) }

  describe '#build' do
    it 'records a discipline incident' do
      expect { row.build.save! }.to change(DisciplineIncident, :count).by(1)
    end

    it 'creates the appropriate school year' do
      expect { row.build }.to change(SchoolYear, :count).by(1)
      expect(SchoolYear.last.name).to eq('1981-1982')
    end
  end
end
