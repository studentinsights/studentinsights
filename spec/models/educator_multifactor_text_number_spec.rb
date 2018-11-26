require 'rails_helper'

RSpec.describe EducatorMultifactorTextNumber, type: :model do
  let!(:pals) { TestPals.create! }

  describe 'validations' do
    it 'allows creating valid records' do
      expect(EducatorMultifactorTextNumber.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550077',
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details).to eq({})
    end

    it 'does not allow duplicate records for educator' do
      expect(EducatorMultifactorTextNumber.create({
        educator_id: pals.uri.id,
        sms_number: '+15555553333',
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details[:educator].first[:error]).to eq(:taken)
    end

    it 'does not allow duplicate ROTP secrets per user' do
      existing_secret = EducatorMultifactorTextNumber.first.rotp_secret
      expect(EducatorMultifactorTextNumber.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555553333',
        rotp_secret: existing_secret
      }).errors.details[:rotp_secret].first[:error]).to eq(:taken)
    end

    it 'does seed with duplicate ROTP secrets' do
      expect(EducatorMultifactorTextNumber.pluck(:rotp_secret).uniq.size).to eq EducatorMultifactorTextNumber.all.size
    end

    it 'does not allow phone number collisions across educators' do
      expect(EducatorMultifactorTextNumber.create({
        educator_id: pals.shs_jodi.id,
        sms_number: '+15555550007',
        rotp_secret: ROTP::Base32.random_base32
      }).errors.details).to eq({
        sms_number: [{:error=>:taken, :value=>'+15555550007'}]
      })
    end

    it 'does not allow invalid phone numbers' do
      ['+5555550077', '15555550077', '555-555-0077', '5555550077'].each do |invalid_number|
        expect(EducatorMultifactorTextNumber.create({
          educator_id: pals.shs_jodi.id,
          sms_number: invalid_number,
          rotp_secret: ROTP::Base32.random_base32
        }).errors.details[:sms_number].first[:error]).to eq(:invalid), "for invalid_number: #{invalid_number}"
      end
    end
  end
end
