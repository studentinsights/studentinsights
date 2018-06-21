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

  describe '#is_service_working_json' do
    let!(:pals) { TestPals.create! }

    def make_request(service_type_id)
      request.env['HTTPS'] = 'on'
      get :is_service_working_json, params: {
        format: :json, service_type_id: service_type_id
      }
    end

    context 'districtwide educator logged in' do
      it 'succeeds and sends down data as JSON' do
        sign_in(pals.uri)
        make_request(502)
        expect(response).to be_success
        expect(JSON.parse(response.body)).to eq({'chart_data' => []})
      end
    end

    context 'classroom teacher logged in' do
      it 'does not succeed' do
        sign_in(pals.shs_bill_nye)
        make_request(502)
        expect(response).not_to be_success
        expect(JSON.parse(response.body)).to eq({'error' => 'You don\'t have the correct authorization.'})
      end
    end

    context 'educator not logged in' do
      it 'does not succeed' do
        make_request(502)
        expect(response).not_to be_success
        expect(JSON.parse(response.body)).to eq({'error' => 'You need to sign in before continuing.'})
      end
    end
  end

  describe '#is_service_working' do
    let!(:pals) { TestPals.create! }

    def make_request
      request.env['HTTPS'] = 'on'
      get :is_service_working
    end

    context 'districtwide educator logged in' do
      it 'succeeds' do
        sign_in(pals.uri)
        make_request
        expect(response).to be_success
      end
    end

    context 'classroom teacher logged in' do
      it 'does not succeed' do
        sign_in(pals.shs_bill_nye)
        make_request
        expect(response).not_to be_success
        expect(response).to redirect_to('/not_authorized')
      end
    end

    context 'educator not logged in' do
      it 'does not succeed' do
        make_request
        expect(response).not_to be_success
        expect(response).to redirect_to('/educators/sign_in')
      end
    end
  end

end
