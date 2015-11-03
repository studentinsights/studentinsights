require 'rails_helper'

describe EducatorsController, :type => :controller do

  describe '#reset_session_clock' do
    def make_request
      request.env['HTTPS'] = 'on'
      request.env["devise.mapping"] = Devise.mappings[:educator]
      get :reset_session_clock, format: :json
    end

    context 'educator is not logged in' do
      it 'returns 401 Unauthorized' do
        make_request
        expect(response).to have_http_status(:unauthorized)
      end
    end
    context 'educator is logged in' do
      before(:each) do
        sign_in FactoryGirl.create(:educator)
        make_request
      end
      it 'succeeds' do
        expect(response).to have_http_status(:success)
      end
      it 'resets the session clock' do
        # TODO: Get Devise test helpers like `educator_session`
        # working within the Rspec controller context:
        # expect(educator_session["last_request_at"]).eq Time.now
      end
    end
  end
end
