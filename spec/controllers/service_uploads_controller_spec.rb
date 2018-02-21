require 'rails_helper'

RSpec.describe ServiceUploadsController, type: :controller do

  describe '#create' do
    let(:educator) { FactoryGirl.create(:educator, districtwide_access: true, admin: true) }

    before do
      FactoryGirl.create(:student, local_id: '111', first_name: 'Edson', last_name: 'Min')
      FactoryGirl.create(:student, local_id: '222', first_name: 'Allison', last_name: 'Keegan')
      sign_in(educator)
    end

    def make_post_request(params)
      request.env['HTTPS'] = 'on'
      post :create, params: params.merge(format: :json)
    end

    let(:response_json) { JSON.parse(response.body) }

    context 'valid data' do
      let(:params) {
        {
          file_name: 'unique_file_name.csv',
          service_type_name: 'Attendance Officer',
          student_lasids: ['111', '222'],
          recorded_at: '01/19/2017',
          date_started: '01/01/2017',
          date_ended: '03/03/2017',
        }
      }

      it 'creates two services' do
        expect { make_post_request(params) }.to change { Service.count }.by(2)
      end

      it 'returns the correct JSON' do
        make_post_request(params)
        expect(response_json['service_upload']['file_name']).to eq('unique_file_name.csv')
        expect(response_json['service_upload']['services'].count).to eq 2
      end

      it 'sets the correct uploaded_by_educator_id' do
        make_post_request(params)
        expect(ServiceUpload.last.uploaded_by_educator_id).to eq educator.id
      end
    end

    context 'end date before start date (invalid!)' do
      let(:params) {
        {
          file_name: 'unique_file_name.csv',
          service_type_name: 'Attendance Officer',
          student_lasids: ['111', '222'],
          recorded_at: '01/19/2017',
          date_started: '04/20/2017',
          date_ended: '03/03/2017',
        }
      }

      it 'creates zero services' do
        expect { make_post_request(params) }.to change { Service.count }.by 0
      end

      it 'returns error JSON with student names and correct error messages' do
        make_post_request(params)
        expect(response_json).to eq({
          "errors" => [
            "Edson Min: discontinued_at must be after service start date",
            "Allison Keegan: discontinued_at must be after service start date"
          ]
        })
      end
    end

    context 'invalid file name' do
      let!(:existing_service_upload) { ServiceUpload.create(file_name: 'unique_file_name.csv') }
      let(:params) {
        {
          service_type_name: 'Attendance Officer',
          file_name: 'unique_file_name.csv',
          student_lasids: ['111', '222'],
          date_started: '01/01/2017',
          date_ended: '03/03/2017',
        }
      }

      it 'returns the correct JSON' do
        make_post_request(params)
        expect(response_json).to eq({
          "errors" => ["Upload: file_name has already been taken"]
        })
      end
    end

    context 'invalid service type' do
      let(:params) {
        {
          file_name: 'file_name.csv',
          service_type_name: 'Extra Defense Against The Dark Arts Tutoring',
          student_lasids: ['111', '222'],
          date_started: '01/01/2017',
          date_ended: '03/03/2017',
        }
      }

      it 'returns the correct JSON' do
        make_post_request(params)
        expect(response_json).to eq({
          "errors"=>[
            "Edson Min: service_type_id can't be blank",
            "Allison Keegan: service_type_id can't be blank"
          ]
        })
      end
    end

    context 'incorrect student LASID' do
      let(:params) {
        {
          file_name: 'unique_file_name.csv',
          service_type_name: 'Attendance Officer',
          student_lasids: ['777'],
          recorded_at: '01/19/2017',
          date_started: '01/01/2017',
          date_ended: '03/03/2017',
        }
      }

      it 'returns the correct JSON' do
        make_post_request(params)
        expect(response_json['errors']).to eq(["student can't be blank"])
      end
    end

  end

  describe '#index' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :index
    end

    context 'educator signed in' do

      before { sign_in(educator) }

      context 'educator w districtwide access' do
        let(:educator) { FactoryGirl.create(:educator, districtwide_access: true, admin: true) }
        it 'can access the page' do
          make_request
          expect(response).to be_success
        end
      end

      context 'educator w/o districtwide access' do
        let(:educator) { FactoryGirl.create(:educator) }
        it 'cannot access the page; gets redirected' do
          make_request
          expect(JSON.parse(response.body)).to eq({ "error" => "You don't have the correct authorization." })
        end
      end
    end

    context 'not signed in' do
      it 'redirects' do
        make_request
        expect(response).to redirect_to(new_educator_session_url)
      end
    end

  end

  describe '#past' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :past
    end

    context 'educator signed in' do

      before { sign_in(educator) }

      context 'educator w districtwide access' do
        let(:educator) {
          FactoryGirl.create(:educator, districtwide_access: true, admin: true)
        }

        let!(:service_upload) {
          ServiceUpload.create!(file_name: 'helpful-service.txt')
        }

        let(:response_body) { JSON.parse(response.body) }

        it 'sends down service upload data as JSON' do
          make_request
          expect(response_body.class).to eq Array
          expect(response_body.size).to eq 1
          expect(response_body[0]['file_name']).to eq 'helpful-service.txt'
        end
      end

      context 'educator w/o districtwide access' do
        let(:educator) { FactoryGirl.create(:educator) }
        let!(:service_upload) {
          ServiceUpload.create!(file_name: 'helpful-service.txt')
        }

        it 'sends down JSON error' do
          make_request
          expect(JSON.parse(response.body)).to eq({ "error" => "You don't have the correct authorization." })
        end
      end
    end

    context 'not signed in' do
      it 'redirects' do
        make_request
        expect(response).to redirect_to(new_educator_session_url)
      end
    end

  end

end
