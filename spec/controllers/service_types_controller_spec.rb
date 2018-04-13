require 'rails_helper'

describe ServiceTypesController, :type => :controller do

  describe '#index' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :index, params: { format: :json }
    end

    let(:parsed_response) { JSON.parse(response.body) }

    context 'educator logged in' do
      let(:educator) { FactoryBot.create(:educator) }
      it 'returns an array of student lasids' do
        sign_in(educator)
        make_request
        expect(parsed_response).to eq [
          "Afterschool Tutoring",
           "Attendance Contract",
           "Attendance Officer",
           "Behavior Contract",
           "Community Schools",
           "Counseling, in-house",
           "Counseling, outside",
           "Freedom School",
           "Math intervention",
           "Reading intervention",
           "SomerSession",
           "Summer Program for English Language Learners",
           "X-Block"
          ]
      end
    end

    context 'no educator logged in' do
      it 'returns an error' do
        make_request
        expect(parsed_response).to eq({"error"=>"You need to sign in before continuing."})
      end
    end

  end

end
