require 'rails_helper'

RSpec.describe TransitionNotesController, type: :controller do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#update' do
    it 'works' do
      sign_in(pals.west_counselor)
      post :update, params: {
        format: :json,
        id: pals.west_eighth_ryan.id,
        text: 'foo',
        is_restricted: false
      }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json['result']).to eq 'ok'
    end
  end
end
