require 'rails_helper'

RSpec.describe Intervention, type: :model do

  describe '#name' do
    context 'has custom intervention name' do
      let(:intervention) { FactoryBot.create(:intervention, :custom_intervention_name) }
      it 'shows the custom intervention name' do
        expect(intervention.name).to eq 'More practice time!'
      end
    end
    context 'does not have custom intervention name' do
      context 'intervention type has name' do
        let(:intervention) { FactoryBot.create(:atp_intervention) }
        it 'shows the intervention type name' do
          expect(intervention.name).to eq 'After-School Tutoring (ATP)'
        end
      end

      context 'intervention type does not have name' do
        let(:intervention) { FactoryBot.create(:intervention) }
        it 'returns nil' do
          expect(intervention.name).to eq nil
        end
      end
    end
  end

  describe '.with_start_and_end_dates' do
    context 'intervention with no end date' do
      let!(:intervention) { FactoryBot.create(:intervention) }
      it 'returns an empty collection' do
        expect(described_class.with_start_and_end_dates).to be_blank
      end
    end
    context 'intervention with end date' do
      let!(:intervention) { FactoryBot.create(:intervention, :end_date) }
      it 'returns the intervention' do
        expect(described_class.with_start_and_end_dates).to eq [intervention]
      end
    end
  end

end
