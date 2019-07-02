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

  describe '#homerooms_json' do
    it 'works' do
      sign_in(pals.uri)
      get :homerooms_json, params: { format: :json }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json.keys).to eq ['district_name', 'students']
      expect(json['students'].first.keys).to contain_exactly(*[
        'id',
        'counselor',
        'first_name',
        'grade',
        'has_photo',
        'homeroom',
        'house',
        'last_name',
        'program_assigned',
        'school',
        'sped_liaison',
        'sped_placement'
      ])
    end

    it 'guards authorization' do
      sign_in(pals.shs_jodi)
      get :homerooms_json, params: { format: :json }
      json = JSON.parse(response.body)
      expect(response.status).to eq 403
      expect(json.keys).to eq ['error']
    end
  end

  describe '#discipline_csv' do
    it 'guards authorization' do
      sign_in(pals.shs_jodi)
      get :discipline_csv
      expect(response.status).to eq 302
    end

    it 'returns CSV with correct shape' do
      3.times do
        FactoryBot.create(:discipline_incident, student: pals.shs_senior_kylo)
      end
      sign_in(pals.uri)
      get :discipline_csv
      expect(response.status).to eq 200
      expect(response.body.split("\n").size).to eq 4
      expect(response.body.split("\n").first).to eq 'id,incident_code,created_at,updated_at,incident_location,incident_description,occurred_at,has_exact_time,student_id,student.id,student.grade,student.hispanic_latino,student.race,student.free_reduced_lunch,student.created_at,student.updated_at,student.homeroom_id,student.first_name,student.last_name,student.state_id,student.home_language,student.school_id,student.student_address,student.registration_date,student.local_id,student.program_assigned,student.sped_placement,student.disability,student.sped_level_of_need,student.plan_504,student.limited_english_proficiency,student.most_recent_mcas_math_growth,student.most_recent_mcas_ela_growth,student.most_recent_mcas_math_performance,student.most_recent_mcas_ela_performance,student.most_recent_mcas_math_scaled,student.most_recent_mcas_ela_scaled,student.most_recent_star_reading_percentile,student.most_recent_star_math_percentile,student.enrollment_status,student.date_of_birth,student.gender,student.primary_phone,student.primary_email,student.house,student.counselor,student.sped_liaison,student.missing_from_last_export,student.ell_entry_date,student.ell_transition_date'
    end
  end
end
