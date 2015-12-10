require 'rails_helper'

RSpec.describe ProgressNotesController, type: :controller do
  def make_request(params)
    request.env['HTTPS'] = 'on'
    post :create, format: :js, progress_note: params
  end

  context 'educator logged in' do
    let!(:educator) { FactoryGirl.create(:educator) }
    let!(:student) { FactoryGirl.create(:student) }
    let!(:intervention) { FactoryGirl.create(:atp_intervention, student: student) }

    before do
      sign_in(educator)
    end

    context 'valid request' do
      let(:params) {
        {
          educator_id: educator.id,
          intervention_id: intervention.id,
          content: 'note text goes here'
        }
      }
      it 'creates a new intervention' do
        expect { make_request(params) }.to change(ProgressNote, :count).by 1
      end
      it 'responds with json' do
        make_request(params)
        expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
        expect(response.status).to eq 200
        expect(JSON.parse(response.body)).to eq({
          "id" => 2,
          "educator_email" => educator.email,
          "content" => "note text goes here",
          "created_date" => Time.now.utc.strftime("%B %e, %Y %l:%M %p")
        })
      end
    end

    context 'invalid request' do
      let(:params) { { educator_id: educator.id } }
      it 'returns errors as json' do
        make_request(params)
        expect(response.status).to eq 422
        expect(JSON.parse(response.body)).to eq({
          "errors" => [
            "Intervention can't be blank",
            "Content can't be blank",
            "Intervention can't be blank"
          ]
        })
      end
    end
  end

  context 'educator not logged in' do
    let(:params) { { educator_id: 42 } }
    it 'does not create anything' do
      expect { make_request(params) }.to change(ProgressNote, :count).by 0
    end
    it 'redirects to sign in page' do
      make_request(params)
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
