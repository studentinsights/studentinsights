require 'rails_helper'

describe DistrictController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }

  describe '#overview_json' do
    let!(:pals) { TestPals.create! }

    def request_page
      request.env['HTTPS'] = 'on'
      get :overview_json, params: { format: :json }
      response
    end

    it 'works and filters out schools without active students (eg, PIC)' do
      sign_in(pals.uri)
      response = request_page()
      expect(response.status).to eq 200
      expect(JSON.parse(response.body)).to eq({
        "show_work_board" => true,
        "enable_student_voice_uploads" => true,
        "current_educator" => {
          "id"=>pals.uri.id,
          "admin"=>true,
          "can_set_districtwide_access"=>true,
          "labels"=>[
            'can_upload_student_voice_surveys',
            'should_show_levels_shs_link',
            'enable_reading_benchmark_data_entry',
            'profile_enable_minimal_reading_data',
            'enable_equity_experiments',
            'enable_reading_debug'
          ]
        },
       "schools" => [
          {"id"=>pals.healey.id, "name"=>pals.healey.name},
          {"id"=>pals.west.id, "name"=>pals.west.name},
          {"id"=>pals.shs.id, "name"=>pals.shs.name}
        ]
      })
    end

    it 'guards acces' do
      (Educator.all - [pals.uri, pals.rich_districtwide]).each do |educator|
        sign_in(educator)
        response = request_page()
        expect(response.status).to eq 403
        sign_out(educator)
      end
    end
  end

  describe '#enrollment_json' do
    it 'works' do
      sign_in(pals.uri)
      get :enrollment_json, params: { format: :json }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json.keys).to eq ['district_key', 'district_name', 'enrollments']
      expect(json['enrollments']).to contain_exactly(*[
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
          "grade"=>"8",
          "school"=>
           {"id"=>pals.west.id,
            "school_type"=>"ESMS",
            "name"=>"West Somerville Neighborhood",
            "local_id"=>"WSNS",
            "slug"=>"wsns"
          }
        }, {
          "enrollment"=>2,
          "grade"=>"9",
          "school"=>{
            "id"=>pals.shs.id,
            "school_type"=>"HS",
            "name"=>"Somerville High",
            "local_id"=>"SHS",
            "slug"=>"shs"}
        }, {
          "enrollment"=>1,
          "grade"=>"12",
          "school"=>{
            "id"=>pals.shs.id,
            "school_type"=>"HS",
            "name"=>"Somerville High",
            "local_id"=>"SHS",
            "slug"=>"shs"}
        }
      ])
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
