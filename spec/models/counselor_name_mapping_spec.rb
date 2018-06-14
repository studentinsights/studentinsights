require 'spec_helper'

RSpec.describe CounselorNameMapping do
  let!(:pals) { TestPals.create! }

  describe 'validations' do
    it 'requires educator_id' do
      expect(CounselorNameMapping.create({
        educator_id: nil,
        counselor_field_text: 'lastname'
      }).errors.details).to eq({
        educator: [{error: :blank}]
      })
    end

    it 'requires counselor_field_text' do
      expect(CounselorNameMapping.create({
        educator_id: pals.shs_ninth_grade_counselor.id,
        counselor_field_text: nil
      }).errors.details).to eq({
        counselor_field_text: [{error: :blank}]
      })
    end

    it 'enforces unique counselor_field_text' do
      expect(CounselorNameMapping.create({
        educator_id: pals.shs_ninth_grade_counselor.id,
        counselor_field_text: 'sofia'
      }).errors.details).to eq({
        counselor_field_text: [{:error=>:taken, :value=>"sofia"}]
      })
    end

    it 'requires downcase' do
      expect(CounselorNameMapping.create({
        educator_id: pals.shs_ninth_grade_counselor.id,
        counselor_field_text: 'LASTNAME'
      }).errors.details).to eq({
        counselor_field_text: [{:error=>"must be lowercase"}]
      })
    end
  end

  describe '.has_mapping?' do
    it 'finds existing TestPals mapping' do
      expect(CounselorNameMapping.has_mapping?(pals.shs_ninth_grade_counselor.id, 'sofia')).to eq true
    end

    it 'does not match on wrong educators' do
      (Educator.all - [pals.shs_ninth_grade_counselor]).each do |educator|
        expect(CounselorNameMapping.has_mapping?(educator.id, 'sofia')).to eq false
      end
    end

    it 'is case insensitive when looking for mapping' do
      expect(CounselorNameMapping.has_mapping?(pals.shs_ninth_grade_counselor.id, 'SOFIA')).to eq true
    end

    it 'considers text when looking for mapping' do
      expect(CounselorNameMapping.has_mapping?(pals.shs_ninth_grade_counselor.id, 'sophie')).to eq false
    end
  end
end
