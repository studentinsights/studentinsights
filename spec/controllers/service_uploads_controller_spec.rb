require 'rails_helper'

RSpec.describe ServiceUploadsController, type: :controller do
  describe '#lasids' do
    let!(:pals) { TestPals.create! }
    def make_request
      request.env['HTTPS'] = 'on'
      get :lasids, params: { format: :json }
    end

    let(:parsed_response) { JSON.parse(response.body) }

    it 'returns an array of student lasids' do
      sign_in(pals.uri)
      make_request
      expect(parsed_response).to contain_exactly(*[
        pals.west_eighth_ryan.local_id,
        pals.shs_freshman_mari.local_id,
        pals.shs_freshman_amir.local_id,
        pals.healey_kindergarten_student.local_id
      ])
    end

    context 'authorization' do
      it 'guards if no access' do
        sign_in(pals.shs_jodi)
        make_request
        expect(response.status).to eq 403
      end

      it 'guards if not signed in' do
        make_request
        expect(response.status).to eq 401
      end
    end
  end

  describe '#create' do
    let(:educator) { FactoryBot.create(:educator, can_set_districtwide_access: true) }
    before { sign_in(educator) }

    def make_post_request(params)
      request.env['HTTPS'] = 'on'
      post :create, params: params.merge(format: :json)
    end

    let(:response_json) { JSON.parse(response.body) }

    context 'valid data' do
      before do
        FactoryBot.create(:student, local_id: '111')
        FactoryBot.create(:student, local_id: '222')
      end

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
      before do
        FactoryBot.create(:student, local_id: '111')
        FactoryBot.create(:student, local_id: '222')
      end

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

      it 'creates two services' do
        expect {
          make_post_request(params)
        }.to change {
          Service.count
        }.by 2
      end

      it 'returns the correct JSON' do
        make_post_request(params)
        expect(response_json['service_upload']['file_name']).to eq('unique_file_name.csv')
        expect(response_json['service_upload']['services'].count).to eq 2
        expect(response_json['errors']).to eq [
          'Could not save service end date. (Must end after service start date.)',
          'Could not save service end date. (Must end after service start date.)',
        ]
      end
    end

    context 'invalid file name' do
      let!(:existing_service_upload) { ServiceUpload.create(file_name: 'unique_file_name.csv') }
      let(:params) {
        {
          file_name: 'unique_file_name.csv'
        }
      }

      it 'returns the correct JSON' do
        make_post_request(params)
        expect(response_json).to eq(
          {"errors"=>["Service upload invalid. Maybe the file name is missing or not unique?"]}
        )
      end
    end

    context 'invalid service type' do
      let(:params) {
        {
          file_name: 'file_name.csv',
          service_type_name: 'Extra Defense Against The Dark Arts Tutoring',
        }
      }

      it 'returns the correct JSON' do
        make_post_request(params)
        expect(response_json).to eq(
          {"errors"=>["Service Type not found..."]}
        )
      end
    end

    context 'incorrect student LASID' do
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

      it 'returns the correct JSON: '\
         '(no error b/c this means Uri confirmed the LASID mismatch was OK)' do
        make_post_request(params)
        expect(response_json['errors']).to eq []
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

      context 'educator with access' do
        let(:educator) { FactoryBot.create(:educator, can_set_districtwide_access: true) }
        it 'can access the page' do
          make_request
          expect(response).to be_successful
        end
      end

      context 'educator w/o access' do
        let(:educator) { FactoryBot.create(:educator) }
        it 'cannot access the page; gets redirected' do
          make_request
          expect(response.status).to eq 302
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
      get :past, format: :json
    end

    context 'educator signed in' do

      before { sign_in(educator) }

      context 'educator w access' do
        let(:educator) { FactoryBot.create(:educator, can_set_districtwide_access: true) }

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

      context 'educator w/o access' do
        let(:educator) { FactoryBot.create(:educator) }
        let!(:service_upload) {
          ServiceUpload.create!(file_name: 'helpful-service.txt')
        }

        it 'guards access' do
          make_request
          expect(response.status).to eq 403
        end
      end
    end

    context 'not signed in' do
      it 'redirects' do
        make_request
        expect(response.status).to eq 401
      end
    end

  end

end
