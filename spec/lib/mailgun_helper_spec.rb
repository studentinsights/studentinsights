require 'spec_helper'

RSpec.describe MailgunHelper do
  describe '.should_use_mock?' do
    it 'returns true by default in test' do
      expect(MailgunHelper.should_use_mock?).to eq true
    end

    it 'returns true by default in development' do
      allow(Rails.env).to receive(:development?).and_return(true)
      expect(MailgunHelper.should_use_mock?).to eq true
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
          expect(MailgunHelper.should_use_mock?).to eq(false), "for district_key: #{district_key}"
        end
      end

      context 'when USE_MOCK_TWILIO is set' do
        before do
          @use_mock_mailgun = ENV['USE_MOCK_MAILGUN']
          ENV['USE_MOCK_MAILGUN'] = 'true'
        end
        after do
          ENV['USE_MOCK_MAILGUN'] = @use_mock_mailgun
        end

        it 'returns true' do
          expect(MailgunHelper.should_use_mock?).to eq true
        end
      end

      context 'when MAILGUN_API_KEY is missing' do
        before do
          @mailgun_api_key = ENV['MAILGUN_API_KEY']
          ENV.delete('MAILGUN_API_KEY')
        end
        after do
          ENV['MAILGUN_API_KEY'] = @mailgun_api_key
        end

        it 'returns true' do
          expect(MailgunHelper.should_use_mock?).to eq true
        end
      end

      context 'when MAILGUN_DOMAIN is missing' do
        before do
          @mailgun_domain = ENV['MAILGUN_DOMAIN']
          ENV.delete('MAILGUN_DOMAIN')
        end
        after do
          ENV['MAILGUN_DOMAIN'] = @mailgun_domain
        end

        it 'returns true' do
          expect(MailgunHelper.should_use_mock?).to eq true
        end
      end
    end
  end
end
