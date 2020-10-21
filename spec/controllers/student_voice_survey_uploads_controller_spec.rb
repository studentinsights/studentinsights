require 'rails_helper'

RSpec.describe StudentVoiceSurveyUploadsController, type: :controller do
  let!(:pals) { TestPals.create! }

  def get_index(educator, params = {})
    sign_in(educator)
    request.env['HTTPS'] = 'on'
    get :index, params: {
      format: :json
    }.merge(params)
  end

  def post_upload(educator, params = {})
    sign_in(educator)
    request.env['HTTPS'] = 'on'
    post :upload, params: {
      format: :json,
      file_name: 'student_voice_survey_2020.csv',
      file_text: IO.read("#{Rails.root}/spec/fixtures/student_voice_survey_2020.csv")
    }.merge(params)
  end

  describe 'integration test' do
    it 'works round trip to import and then read back' do
      expect(StudentVoiceSurveyUpload.count).to eq 0

      post_upload(pals.uri)
      expect(StudentVoiceSurveyUpload.count).to eq 1

      get_index(pals.uri)
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to include({
        "student_voice_survey_uploads"=>[{
          "id"=>a_kind_of(Integer),
          "file_name"=>"student_voice_survey_2020.csv",
          "file_size"=>2112,
          "file_digest"=>"2e6fb2eeaa641e7594cd32cfc61d2acfdc4d3842c3ebc8e39a792ed7bb678246",
          "completed"=>true,
          "stats"=>{
            "created_records_count"=>1,
            "empty_survey_count"=>0,
            "invalid_row_columns_count"=>0,
            "invalid_student_local_id_count"=>0,
            "invalid_student_lodal_ids_list"=>[]
          },
          "created_at"=>a_kind_of(String),
          "uploaded_by_educator"=>{
            "id"=>pals.uri.id,
            "email"=>"uri@demo.studentinsights.org",
            "full_name"=>"Disney, Uri"
          },
          "students"=>[{
            "id"=>pals.shs_freshman_mari.id,
            "grade"=>"9",
            "first_name"=>"Mari",
            "last_name"=>"Kenobi"
          }]
        }],
        "student_voice_survey_form_url"=>"https://example.com/this-is-the-survey"
      })
    end
  end

  describe '#index' do
    it 'enforces authorization' do
      (Educator.all - [pals.uri, pals.shs_jodi]).each do |educator|
        get_index(educator)
        expect(response.status).to eq 403
      end
    end

    it 'works when no data' do
      get_index(pals.uri)
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to eq({
        "student_voice_survey_uploads"=>[],
        "student_voice_survey_form_url"=>"https://example.com/this-is-the-survey"
      })
    end
  end

  describe '#upload' do
    it 'enforces authorization' do
      (Educator.all - [pals.uri, pals.shs_jodi]).each do |educator|
        post_upload(educator)
        expect(response.status).to eq 403
      end
    end

    it 'works on happy path' do
      expect(StudentVoiceSurveyUpload.count).to eq 0
      post_upload(pals.uri)
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to eq({
        "stats"=>{
          "created_records_count"=>1,
          "empty_survey_count"=>0,
          "invalid_row_columns_count"=>0,
          "invalid_student_local_id_count"=>0,
          "invalid_student_lodal_ids_list"=>[]
        }
      })
      expect(StudentVoiceSurveyUpload.count).to eq 1

      upload = StudentVoiceSurveyUpload.first
      expect(upload.as_json).to include({
        "id"=>a_kind_of(Integer),
        "file_name"=>"student_voice_survey_2020.csv",
        "file_size"=>2112,
        "file_digest"=> "2e6fb2eeaa641e7594cd32cfc61d2acfdc4d3842c3ebc8e39a792ed7bb678246",
        "created_at"=>a_kind_of(String),
        "updated_at"=>a_kind_of(String),
        "uploaded_by_educator_id"=>pals.uri.id,
        "completed"=>true,
        "stats"=>{
          "created_records_count"=>1,
          "empty_survey_count"=>0,
          "invalid_row_columns_count"=>0,
          "invalid_student_local_id_count"=>0,
          "invalid_student_lodal_ids_list"=>[]
        }
      })

      surveys = upload.student_voice_completed2020_surveys
      expect(surveys.size).to eq 1
      expect(surveys.first.as_json).to include({
        "id"=>a_kind_of(Integer),
        "student_voice_survey_upload_id"=>a_kind_of(Integer),
        "student_id"=>pals.shs_freshman_mari.id,
        "form_timestamp"=>a_kind_of(String),
        "shs_adult"=>"Yes",
        "mentor_schedule"=>"The Current Schedule Meets My Needs",
        "guardian_email"=>"parent@guardian.com",
        "guardian_numbers"=>"Mom: 555-555-5555, Uncle: 666-666-6666",
        "home_language"=>"Spanish",
        "pronouns"=>"they/them",
        "share_pronouns_with_family"=>"no",
        "job"=>"yes",
        "job_hours"=>"Monday, Wednesday 5-8",
        "sibling_care"=>"Yes",
        "sibling_care_time"=>"Monday-Friday 3-4",
        "remote_learning_difficulties"=>"Yes",
        "reliable_internet"=>"No",
        "devices"=>"chromebook;additional laptop/desktop;cell phone",
        "sharing_space"=>"Yes",
        "remote_learning_likes"=>"Easy to be on time",
        "remote_learning_struggles"=>"Internet",
        "camera_comfort"=>"No",
        "camera_comfort_reasons"=>"I share a room with too many people",
        "mic_comfort"=>"No",
        "mic_comfort_reasons"=>"I share a room with too many people",
        "learning_style"=>"visual",
        "outside_school_activity"=>"Play Basketball",
        "personal_characteristics"=>"Honesty",
        "three_words"=>"Funny, Strong, Kind",
        "other_share"=>"I hope to be back in school soon",
        "created_at"=>a_kind_of(String),
        "updated_at"=>a_kind_of(String)
      })
    end
  end
end
