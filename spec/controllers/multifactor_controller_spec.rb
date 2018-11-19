require 'rails_helper'

describe MultifactorController, :type => :controller do
  let!(:pals) { TestPals.create! }

  describe '#send_code' do
    it 'works when not signed in' do
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      post :send_code, params: { format: :json }
      expect(response.status).to eq 201
      expect(JSON.parse(response.body)).to eq({'status' => 'ok'})
    end

    it 'raises when signed in' do
      request.env['HTTPS'] = 'on'
      sign_in(pals.uri)
      request.env['HTTP_ACCEPT'] = 'application/json'
      post :send_code, params: { format: :json }
      expect(response.status).to eq 403
      expect(JSON.parse(response.body)).to eq({'error' => 'unauthorized'})
    end
  end
end
