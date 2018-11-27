require 'spec_helper'

RSpec.describe MockTwilioClient do
  describe '.should_use?' do
    it 'returns true by default in test' do
      expect(MockTwilioClient.should_use?).to eq true
    end

    it 'returns true by default in development' do
      allow(Rails.env).to receive(:development?).and_return(true)
      expect(MockTwilioClient.should_use?).to eq true
    end

    context 'when production' do
      before do
        allow(Rails.env).to receive(:test?).and_return(false)
        allow(Rails.env).to receive(:development?).and_return(false)
      end

      it 'returns false for sites' do
        district_keys = [
          PerDistrict::SOMERVILLE,
          PerDistrict::BEDFORD,
          PerDistrict::NEW_BEDFORD
        ]
        district_keys.each do |district_key|
          allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: district_key))
          expect(MockTwilioClient.should_use?).to eq(false), "for district_key: #{district_key}"
        end
      end

      it 'returns true for demo' do
        allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::DEMO))
        expect(MockTwilioClient.should_use?).to eq true
      end
    end
  end
end
