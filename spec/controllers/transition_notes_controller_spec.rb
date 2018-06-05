require 'rails_helper'

RSpec.describe TransitionNotesController, type: :controller do
  let!(:pals) { TestPals.create! }
  let(:student) { pals.west_eighth_ryan }
  let!(:time_now) { pals.time_now }

  let(:params) {
    {
      format: :json,
      student_id: student.id,
      text: 'foo',
      is_restricted: false
    }
  }

  describe '#update' do
    def update(params)
      request.env['HTTPS'] = 'on'
      post :update, params: params
    end

    context 'good params, authorized educator' do
      it 'works' do
        sign_in(pals.west_counselor)
        update(params)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['result']).to eq 'ok'
      end
    end

    context 'non-K8 counselor educator' do
      it 'does not work' do
        sign_in(pals.west_marcus_teacher)
        update(params)
        expect(response.status).to eq 403
      end
    end

  end
end
