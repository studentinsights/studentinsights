require 'rails_helper'

RSpec.describe InterventionsController, type: :controller do

  describe '#create' do
    def make_post_request(options = {})
      request.env['HTTPS'] = 'on'
      post :create, format: :js, intervention: options[:params]
    end

    context 'educator logged in' do
      let!(:educator) { FactoryGirl.create(:educator) }
      let!(:student) { FactoryGirl.create(:student) }

      before do
        sign_in(educator)
      end

      context 'valid request' do
        let(:params) {
          {
            educator_id: educator.id,
            student_id: student.id,
            intervention_type_id: 1,
          }
        }
        it 'creates a new intervention' do
          expect { make_post_request(params: params) }.to change(Intervention, :count).by 1
        end
        it 'responds with js' do
          make_post_request(params: params)
          expect(response.headers["Content-Type"]).to eq "text/javascript; charset=utf-8"
        end
      end
      context 'invalid request' do
        it 'raises an error' do
          expect { make_post_request }.to raise_error ActionController::ParameterMissing
        end
      end
    end
    context 'educator not logged in' do
      let(:params) { {} }
      it 'does not create an intervention' do
        expect { make_post_request(params: params) }.to change(Intervention, :count).by 0
      end
      it 'redirects to sign in page' do
        make_post_request(params: params)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
