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

      it 'returns false for all sites' do
        district_keys = [
          PerDistrict::SOMERVILLE,
          PerDistrict::BEDFORD,
          PerDistrict::NEW_BEDFORD,
          PerDistrict::DEMO
        ]
        district_keys.each do |district_key|
          allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: district_key))
          expect(MockTwilioClient.should_use?).to eq(false), "for district_key: #{district_key}"
        end
      end

      context 'when USE_MOCK_TWILIO is set' do
        before do
          @use_mock_twilio = ENV['USE_MOCK_TWILIO']
          ENV['USE_MOCK_TWILIO'] = 'true'
        end
        after do
          ENV['USE_MOCK_TWILIO'] = @use_mock_twilio
        end

        it 'returns true' do
          expect(MockTwilioClient.should_use?).to eq true
        end
      end

      context 'when no TWILIO_CONFIG_JSON is missing' do
        before do
          @twilio_config_json = ENV['TWILIO_CONFIG_JSON']
          ENV.delete('TWILIO_CONFIG_JSON')
        end
        after do
          ENV['TWILIO_CONFIG_JSON'] = @twilio_config_json
        end

        it 'returns true' do
          expect(MockTwilioClient.should_use?).to eq true
        end
      end
    end
  end
end
