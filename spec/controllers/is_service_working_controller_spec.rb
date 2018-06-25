require 'rails_helper'

describe IsServiceWorkingController, :type => :controller do

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
        expect(JSON.parse(response.body)).to eq({
          'error' => 'unauthorized'
        })
      end
    end

    context 'educator not logged in' do
      it 'does not succeed' do
        make_request(502)
        expect(response).not_to be_success
        expect(JSON.parse(response.body)).to eq({
          'error' => 'You need to sign in before continuing.'
        })
      end
    end
  end

end
