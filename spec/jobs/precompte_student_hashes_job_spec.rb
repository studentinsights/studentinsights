require 'rails_helper'

RSpec.describe PrecomputeStudentHashesJob do

  let(:outcome) { PrecomputedQueryDoc.all }
  let(:first_json_blob) { JSON.parse!(outcome.first.json) }

  describe '#school_overview_precompute_jobs' do

    context 'educator with students' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator, school: school, schoolwide_access: true) }
      let!(:student) { FactoryGirl.create(:student, school: school) }

      before { PrecomputeStudentHashesJob.new.precompute_all!(Time.now) }

      let(:first_json_blob_key) { first_json_blob.keys.first }
      let(:first_json_blob_value) { first_json_blob[first_json_blob_key] }

      it 'returns the correct hash for the job' do
        expect(outcome.size).to eq 1
        expect(first_json_blob_key).to eq "student_hashes"
        expect(first_json_blob_value.first["id"]).to eq student.id
      end
    end

    context 'educator without students' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator, school: school, schoolwide_access: true) }

      before { PrecomputeStudentHashesJob.new.precompute_all!(Time.now) }

      it 'returns an empty array' do
        expect(outcome).to eq []
      end
    end

  end

end
