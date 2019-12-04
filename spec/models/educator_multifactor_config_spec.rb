require 'rails_helper'

RSpec.describe EducatorMultifactorConfig, type: :model do
  let!(:pals) { TestPals.create! }

  describe 'validations' do
    it 'requires a rotp_secret' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550077',
      }).errors.details).to eq(rotp_secret:[{error: :blank}])
    end

    it 'requires valid base32 rotp_secret' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550077',
        rotp_secret: '1'
      }).errors.details).to eq(rotp_secret: [{error: 'not valid base32'}])
    end

    it 'allows creating records for Jodi, with SMS' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550077',
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details).to eq({})
    end

    it 'allows creating records for Jodi, without SMS' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details).to eq({})
    end

    it 'does not allow duplicate records for Uri' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.uri.id,
        sms_number: '+15555553333',
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details[:educator].first[:error]).to eq(:taken)
    end

    it 'does not allow duplicate ROTP secrets for another user' do
      existing_secret = EducatorMultifactorConfig.first.rotp_secret
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555553333',
        rotp_secret: existing_secret
      }).errors.details[:rotp_secret].first[:error]).to eq(:taken)
    end

    it 'does seed with duplicate ROTP secrets' do
      expect(EducatorMultifactorConfig.pluck(:rotp_secret).uniq.size).to eq EducatorMultifactorConfig.all.size
    end

    it 'does not allow SMS collisions across educators' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550009',
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details).to eq({
        sms_number: [{:error=>:taken, :value=>'+15555550009'}]
      })
    end

    it 'does not allow invalid phone numbers' do
      ['+5555550077', '15555550077', '555-555-0077', '5555550077'].each do |invalid_number|
        expect(EducatorMultifactorConfig.create({
          educator_id: pals.shs_jodi.id,
          sms_number: invalid_number,
          rotp_secret: ROTP::Base32.random_base32
        }).errors.details[:sms_number].first[:error]).to eq(:invalid), "for invalid_number: #{invalid_number}"
      end
    end

    it 'does not allow sms_number and via_email to both be set' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550009',
        via_email: true,
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details).to eq({
        sms_number: [{:error=>:taken, :value=>"+15555550009"}, {:error=>"sms_number cannot be set with via_email"}],
        via_email: [{:error=>"via_email cannot be set with sms_number"}],
      })
    end
  end

  describe '#mode' do
    it 'defaults to app' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        rotp_secret: ROTP::Base32.random_base32
      }).mode).to eq(EducatorMultifactorConfig::APP_MODE)
    end

    it 'works for SMS' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550077',
        rotp_secret: ROTP::Base32.random_base32
      }).mode).to eq(EducatorMultifactorConfig::SMS_MODE)
    end

    it 'works for email' do
      expect(EducatorMultifactorConfig.create({
        educator_id: pals.shs_jodi.id,
        via_email: true,
        rotp_secret: ROTP::Base32.random_base32
      }).mode).to eq(EducatorMultifactorConfig::EMAIL_MODE)
    end

    it 'raises if not saved' do
      expect{ EducatorMultifactorConfig.new({
        educator_id: pals.shs_jodi.id,
        rotp_secret: ROTP::Base32.random_base32
      }).mode }.to raise_error Exceptions::InvalidConfiguration
    end

    it 'raises if not valid' do
      expect{ EducatorMultifactorConfig.new({
        educator_id: pals.shs_jodi.id,
        sms_number: '123',
        via_email: true,
        rotp_secret: ROTP::Base32.random_base32
      }).mode }.to raise_error Exceptions::InvalidConfiguration
    end

    it 'raises if changes since save' do
      record = EducatorMultifactorConfig.new({
        educator_id: pals.shs_jodi.id,
        rotp_secret: ROTP::Base32.random_base32
      })
      record.via_email = true
      expect{ record.mode }.to raise_error Exceptions::InvalidConfiguration
    end
    
  end
end
