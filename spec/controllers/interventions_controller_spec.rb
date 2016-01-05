require 'rails_helper'

RSpec.describe InterventionsController, type: :controller do

  describe '#create' do
    def make_post_request(options = {})
      request.env['HTTPS'] = 'on'
      post :create, format: :js, intervention: options[:params]
    end

    context 'educator logged in' do
      let!(:student) { FactoryGirl.create(:student) }
      let(:valid_request_params) {
        {
          educator_id: educator.id,
          student_id: student.id,
          intervention_type_id: 1,
          start_date: '2015/1/1',
          end_date: '2020/6/6'
        }
      }

      before do
        sign_in(educator)
      end

      context 'admin' do
        let!(:educator) { FactoryGirl.create(:educator, :admin) }
          context 'valid request' do
          it 'creates a new intervention' do
            expect { make_post_request(params: valid_request_params) }.to change(Intervention, :count).by 1
          end
          it 'responds with json' do
            make_post_request(params: valid_request_params)
            expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
          end
        end
        context 'invalid request' do
          let(:params) { { educator_id: educator.id } }
          it 'returns errors as json' do
            make_post_request(params: params)
            expect(response.status).to eq 422
            expect(JSON.parse(response.body)).to eq({
              "errors" => [
                "Student can't be blank",
                "Intervention type can't be blank"
              ]
            })
          end
        end
      end

      # Non-admin educators can create interventions, just can't delete / edit

      context 'not admin' do
        let!(:educator) { FactoryGirl.create(:educator) }
        context 'valid request' do
          it 'does not create new intervention' do
            expect { make_post_request(params: valid_request_params) }.to change(Intervention, :count).by 1
          end
          it 'is successful' do
            make_post_request(params: valid_request_params)
            expect(response).to be_success
          end
        end
      end
    end

    context 'not logged in' do
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

  describe '#delete' do
    def make_delete_request(id)
      request.env['HTTPS'] = 'on'
      delete :destroy, format: :js, id: id
    end

    context 'educator logged in' do

      before do
        sign_in(educator)
      end

      context 'admin' do
        let!(:educator) { FactoryGirl.create(:educator, :admin) }

        context 'valid id' do
          let!(:intervention) { FactoryGirl.create(:intervention) }
          it 'deletes the intervention' do
            expect { make_delete_request(intervention.id) }.to change(Intervention, :count).by -1
          end
          it 'is successful' do
            make_delete_request(intervention.id)
            expect(response).to be_success
          end
        end

        context 'garbage id' do
          let(:params) { { id: 'garbarge'} }
          it 'raises an error' do
            expect { make_delete_request('garbage') }.to raise_error ActiveRecord::RecordNotFound
          end
        end
      end

      context 'not admin' do
        let!(:educator) { FactoryGirl.create(:educator) }
        context 'valid id' do
          let!(:intervention) { FactoryGirl.create(:intervention) }
          it 'does not delete the intervention' do
            expect { make_delete_request(intervention.id) }.to change(Intervention, :count).by 0
          end
          it 'redirects' do
            make_delete_request(intervention.id)
            expect(response).to redirect_to new_educator_session_path
          end
        end
      end

    end

    context 'not logged in' do
      let!(:intervention) { FactoryGirl.create(:intervention) }
      it 'does not change the intervention count' do
        expect { make_delete_request(intervention.id) }.to change(Intervention, :count).by 0
      end
      it 'redirects to sign in page' do
        make_delete_request(intervention.id)
        expect(response).to have_http_status(:unauthorized)
      end
    end

  end

end
