require 'rails_helper'

describe UiController, :type => :controller do
  let!(:pals) { TestPals.create! }

  def make_request
    request.env['HTTPS'] = 'on'
    get :ui
  end
  
  describe '#ui' do
    it 'renders minimal json shape inline' do
      sign_in(pals.uri)
      make_request
      expect(response.status).to eq 200
      expect(assigns(:serialized_data).deep_stringify_keys).to eq({
        "current_educator" => {
          "id" => pals.uri.id,
          "admin" => true,
          "school_id" => pals.healey.id,
          "in_experience_team" => false
        }
      }.deep_stringify_keys)
    end

    it 'correctly sets in_experience_team' do
      sign_in(pals.shs_bill_nye)
      make_request
      expect(response.status).to eq 200
      expect(assigns(:serialized_data).deep_stringify_keys).to eq({
        "current_educator" => {
          "id" => pals.shs_bill_nye.id,
          "admin" => false,
          "school_id" => pals.shs.id,
          "in_experience_team" => true
        }
      }.deep_stringify_keys)
    end
  end
end
