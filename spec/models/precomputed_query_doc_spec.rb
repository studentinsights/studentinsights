require 'rails_helper'

RSpec.describe PrecomputedQueryDoc do
  describe '.latest_precomputed_student_hashes_for' do
    let!(:pals) { TestPals.create! }
    
    it 'returns nil when no documents have been precomputed' do
      doc = PrecomputedQueryDoc.latest_precomputed_student_hashes_for([pals.shs_freshman_mari.id])
      expect(doc).to eq nil
    end

    it 'does not return if document is outside freshness window' do
      time_now = Time.now
      authorized_student_ids = [pals.shs_freshman_mari.id]
      
      key = PrecomputedQueryDoc.precomputed_student_hashes_key(authorized_student_ids)
      authorized_students_digest = PrecomputedQueryDoc.authorized_students_digest(authorized_student_ids)
      json_string = '{"student_hashes":"foo"}'
      created_doc = PrecomputedQueryDoc.create!({
        key: key,
        json: json_string,
        authorized_students_digest: authorized_students_digest,
        created_at: time_now - 72.hours
      })
      expect(created_doc.created_at).to eq(time_now - 72.hours)
      expect(PrecomputedQueryDoc.latest_precomputed_student_hashes_for(authorized_student_ids)).to eq nil
    end
  end

  describe '.authorized_students_digest' do
    it 'hashes a list of ids as a set down into a consistent space' do
      expect(PrecomputedQueryDoc.authorized_students_digest([2,1])).to eq '17f8af97ad4a7f7639a4c9171d5185cbafb85462877a4746c21bdb0a4f940ca0'
      expect(PrecomputedQueryDoc.authorized_students_digest([1,2])).to eq '17f8af97ad4a7f7639a4c9171d5185cbafb85462877a4746c21bdb0a4f940ca0'
      expect(PrecomputedQueryDoc.authorized_students_digest([1,2,7])).to eq '8e2e5906844adcae6ce8cea8ad8abacc85d08e77b04a2c847f4387350b375a80'
    end
  end

  describe '.precomputed_student_hashes_key' do
    it 'works for default' do
      key = PrecomputedQueryDoc.precomputed_student_hashes_key([1,2,7])
      expect(key).to eq 'continuous_for_student_ids:3:8e2e5906844adcae6ce8cea8ad8abacc85d08e77b04a2c847f4387350b375a80'
    end

    it 'works for force_deprecated_key' do
      expect(PrecomputedQueryDoc.precomputed_student_hashes_key([1,2,7], {
        time_now: TestPals.new.time_now,
        force_deprecated_key: true
      })).to eq 'precomputed_student_hashes_1520899200_1,2,7'
    end

    it 'works for force_deprecated_day_based_key' do
      expect(PrecomputedQueryDoc.precomputed_student_hashes_key([1,2,7], {
        time_now: TestPals.new.time_now,
        force_deprecated_day_based_key: true
      })).to eq 'short:1520899200:3:8e2e5906844adcae6ce8cea8ad8abacc85d08e77b04a2c847f4387350b375a80'
    end
  end
end
