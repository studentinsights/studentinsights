require 'rails_helper'

describe ClassroomBalancingController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  before { request.env['HTTP_ACCEPT'] = 'application/json' }
  let!(:pals) { TestPals.create! }

  describe '#available_grade_levels_json' do
    it 'works on happy path for Uri' do
      sign_in(pals.uri)
      get :available_grade_levels_json, params: {
        format: :json,
        balance_id: 'foo-balance-id'
      }

      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json).to eq({
        "grade_levels_next_year" => ["1"],
        "schools" => [{
          "id"=>2,
          "school_type"=>"ESMS",
          "name"=>"Arthur D Healey",
          "local_id"=>"HEA"
        }]
      })
    end
  end
end
