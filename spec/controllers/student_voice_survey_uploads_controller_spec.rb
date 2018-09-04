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
      file_name: 'student_voice_survey.csv',
      file_text: IO.read("#{Rails.root}/spec/fixtures/student_voice_survey.csv")
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
          "file_name"=>"student_voice_survey.csv",
          "file_size"=>561,
          "file_digest"=>"a168104bec80a666e5911890d6c56fc901bd06cf76137ad043b1e2dc4ef9df0d",
          "completed"=>true,
          "stats"=>{
            "created_records_count"=>1,
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
          "invalid_row_columns_count"=>0,
          "invalid_student_local_id_count"=>0,
          "invalid_student_lodal_ids_list"=>[]
        }
      })
      expect(StudentVoiceSurveyUpload.count).to eq 1

      upload = StudentVoiceSurveyUpload.first
      expect(upload.as_json).to include({
        "id"=>a_kind_of(Integer),
        "file_name"=>"student_voice_survey.csv",
        "file_size"=>561,
        "file_digest"=> "a168104bec80a666e5911890d6c56fc901bd06cf76137ad043b1e2dc4ef9df0d",
        "created_at"=>a_kind_of(ActiveSupport::TimeWithZone),
        "updated_at"=>a_kind_of(ActiveSupport::TimeWithZone),
        "uploaded_by_educator_id"=>pals.uri.id,
        "completed"=>true,
        "stats"=>{
          "created_records_count"=>1,
          "invalid_row_columns_count"=>0,
          "invalid_student_local_id_count"=>0,
          "invalid_student_lodal_ids_list"=>[]
        }
      })

      surveys = upload.student_voice_completed_surveys
      expect(surveys.size).to eq 1
      expect(surveys.first.as_json).to include({
        "id"=>a_kind_of(Integer),
        "student_voice_survey_upload_id"=>a_kind_of(Integer),
        "student_id"=>pals.shs_freshman_mari.id,
        "form_timestamp"=>a_kind_of(ActiveSupport::TimeWithZone),
        "first_name"=>"Mari",
        "student_lasid"=>"111222222",
        "proud"=>"Stole the most bases in the league this year",
        "best_qualities"=>"Thoughtful and think before I just open my mouth",
        "activities_and_interests"=>"Making podcasts, teaching my sister songs",
        "nervous_or_stressed"=>"when there is too much work and I don't know what to do",
        "learn_best"=>"are kind and explain what we need to do to get good grades",
        "created_at"=>a_kind_of(ActiveSupport::TimeWithZone),
        "updated_at"=>a_kind_of(ActiveSupport::TimeWithZone)
      })
    end
  end
end
