require 'rails_helper'

RSpec.describe StudentVoiceSurveyUploadsController, type: :controller do

  describe '#upload' do
    let!(:pals) { TestPals.create! }

    def post_upload(educator, params = {})
      sign_in(educator)
      request.env['HTTPS'] = 'on'
      post :upload, params: params.merge(format: :json)
    end

    it 'works' do
      expect(StudentVoiceSurveyUpload.count).to eq 0
      post_upload(pals.uri, {
        file_name: 'foo.csv',
        file_text: IO.read('/Users/krobinson/Desktop/DANGER/DANGER-survey.csv')
      })
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to eq({
        "upload_status"=>{
          "invalid_row_columns_count"=>0,
          "invalid_student_local_id_count"=>0,
          "created_records_count"=>119
        }
      })
      expect(StudentVoiceSurveyUpload.count).to eq 119
    end
  end
end
