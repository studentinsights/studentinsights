require 'rails_helper'

RSpec.describe Intervention, type: :model do

  describe '.with_start_and_end_dates' do
    context 'intervention with no end date' do
      let!(:intervention) { FactoryGirl.create(:intervention) }
      it 'returns an empty collection' do
        expect(described_class.with_start_and_end_dates).to be_blank
      end
    end
    context 'intervention with end date' do
      let!(:intervention) { FactoryGirl.create(:intervention, :end_date) }
      it 'returns the intervention' do
        expect(described_class.with_start_and_end_dates).to eq [intervention]
      end
    end
  end

  describe '#cannot_have_both_intervention_type_and_custom_intervention_name' do
    context 'has only an intervention type' do
      let(:intervention) { FactoryGirl.build(:intervention) } # Minimal valid intervention includes an intervention_type association
      it 'is valid' do
        expect(intervention).to be_valid
      end
    end

    context 'has both' do
      let(:intervention) { FactoryGirl.build(:intervention, :custom_intervention_name) }
      it 'is invalid' do
        expect(intervention).to be_invalid
      end
    end
  end

end
