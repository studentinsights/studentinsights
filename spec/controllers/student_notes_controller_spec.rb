require 'rails_helper'

RSpec.describe StudentNotesController, type: :controller do

  describe '#create' do

    def make_post_request(options = {})
      request.env['HTTPS'] = 'on'
      post :create, format: :js, student_note: options[:params]
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
            student_id: student.id,
            content: "Marsha has been doing great in Math!"
          }
        }
        it 'creates a new student note' do
          expect { make_post_request(params: params) }.to change(StudentNote, :count).by 1
        end
        it 'responds with json' do
          make_post_request(params: params)
          expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
        end
      end
      context 'invalid request' do
        let(:params) {
          {
            student_id: student.id    # Missing required content field
          }
        }
        it 'returns errors as json' do
          make_post_request(params: params)
          expect(response.status).to eq 422
          expect(JSON.parse(response.body)).to eq({
            "errors" => [ "Content can't be blank" ]
          })
        end
      end
    end
    context 'educator not logged in' do
      let(:params) { {} }
      it 'does not create an student note' do
        expect { make_post_request(params: params) }.to change(StudentNote, :count).by 0
      end
      it 'redirects to sign in page' do
        make_post_request(params: params)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

end
