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

end
