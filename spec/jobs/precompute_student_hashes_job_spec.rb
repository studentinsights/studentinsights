require 'rails_helper'

RSpec.describe PrecomputeStudentHashesJob do

  # set time at 2017-06-22 10:07:42
  let(:time_now) { Time.at(1498126062) }
  let(:outcome) { PrecomputedQueryDoc.all }
  let(:first_json_blob) { JSON.parse!(outcome.first.json) }
  let(:last_json_blob) { JSON.parse!(outcome.last.json) }
  let(:log) { LogHelper::Redirect.instance.file }

  describe '#school_overview_precompute_jobs' do

    context 'educator with students' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator, school: school, schoolwide_access: true) }
      let!(:student) { FactoryGirl.create(:student, school: school) }

      before { PrecomputeStudentHashesJob.new(log).precompute_all!(time_now) }

      let(:first_json_blob_key) { first_json_blob.keys.first }
      let(:first_json_blob_value) { first_json_blob[first_json_blob_key] }
      let(:last_json_blob_key) { last_json_blob.keys.first }
      let(:last_json_blob_value) { last_json_blob[first_json_blob_key] }

      it 'creates two docs with the correct keys and correct data inside both docs' do
        expect(outcome.size).to eq 2
        expect(outcome.map(&:key)).to eq [
          "short:1498104000:1:b8aed072d29403ece56ae9641638ddd50d420f950bde0eefc092ee8879554141",
          "precomputed_student_hashes_1498104000_#{student.id}"
        ]
        expect(first_json_blob_key).to eq "student_hashes"
        expect(first_json_blob_value.first["id"]).to eq student.id
        expect(last_json_blob_key).to eq "student_hashes"
        expect(last_json_blob_value.first["id"]).to eq student.id
      end
    end

    context 'educator without students' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator, school: school, schoolwide_access: true) }

      before { PrecomputeStudentHashesJob.new(log).precompute_all!(Time.now) }

      it 'returns an empty array' do
        expect(outcome).to eq []
      end
    end

  end

end
