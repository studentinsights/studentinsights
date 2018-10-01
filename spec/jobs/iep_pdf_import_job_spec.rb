# require 'rails_helper'

# RSpec.describe PrecomputeStudentHashesJob do

#   # set time at 2017-06-22 10:07:42
#   let(:time_now) { Time.at(1498126062) }
#   let(:outcome) { PrecomputedQueryDoc.all }
#   let(:first_json_blob) { JSON.parse!(outcome.first.json) }
#   let(:log) { LogHelper::Redirect.instance.file }

#   describe '#school_overview_precompute_jobs' do

#     context 'educator with students' do
#       let!(:school) { FactoryBot.create(:healey) }
#       let!(:educator) { FactoryBot.create(:educator, school: school, schoolwide_access: true) }
#       let!(:student) { FactoryBot.create(:student, school: school) }

#       before { PrecomputeStudentHashesJob.new(log).precompute_all!(time_now) }

#       let(:first_json_blob_key) { first_json_blob.keys.first }
#       let(:first_json_blob_value) { first_json_blob[first_json_blob_key] }

#       it 'creates a doc with the correct key and correct data inside' do
#         expect(outcome.size).to eq 1
#         expect(outcome.first.key.split(':')[0]).to eq "short"
#         expect(outcome.first.key.split(':')[1]).to eq "1498104000"
#         expect(outcome.first.key.split(':')[2]).to eq "1"

#         expect(first_json_blob_key).to eq "student_hashes"
#         expect(first_json_blob_value.first["id"]).to eq student.id
#       end
#     end

#     context 'educators without students' do
#       let!(:school) { FactoryBot.create(:healey) }
#       let!(:educator) { FactoryBot.create(:educator, school: school, schoolwide_access: true) }
#       let!(:educator_not_schoolwide) { FactoryBot.create(:educator, school: school) }

#       before { PrecomputeStudentHashesJob.new(log).precompute_all!(Time.now) }

#       it 'returns an empty array' do
#         expect(outcome).to eq []
#       end
#     end

#   end

# end
