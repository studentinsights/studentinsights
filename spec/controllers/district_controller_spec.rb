require 'rails_helper'

describe DistrictController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }

  describe '#enrollment_json' do
    it 'works' do
      sign_in(pals.uri)
      get :enrollment_json, params: { format: :json }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json.keys).to eq ['district_key', 'district_name', 'enrollments']
      expect(json['enrollments']).to eq([
        {
          "enrollment"=>1,
          "grade"=>"KF",
          "school"=>{
            "id"=>pals.healey.id,
            "school_type"=>"ESMS",
            "name"=>"Arthur D Healey",
            "local_id"=>"HEA",
            "slug"=>"hea"
          }
        }, {
          "enrollment"=>1,
          "grade"=>"9",
          "school"=>{
            "id"=>pals.shs.id,
            "school_type"=>"HS",
            "name"=>"Somerville High",
            "local_id"=>"SHS",
            "slug"=>"shs"
        }
      }])
    end

    it 'guards authorization' do
      sign_in(pals.shs_jodi)
      get :enrollment_json, params: { format: :json }
      json = JSON.parse(response.body)
      expect(response.status).to eq 403
      expect(json.keys).to eq ['error']
    end
  end
end
