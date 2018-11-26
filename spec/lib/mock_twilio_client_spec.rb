require 'spec_helper'

RSpec.describe MockTwilioClient do
  describe '.should_use?' do
    it 'returns true by default in test' do
      expect(MockTwilioClient.should_use?).to eq true
    end
  end
end
