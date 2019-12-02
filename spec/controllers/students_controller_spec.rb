require 'rails_helper'

describe StudentsController, :type => :controller do
  describe '#service' do
    let!(:school) { FactoryBot.create(:school) }

    def make_post_request(student, service_params = {})
      request.env['HTTPS'] = 'on'
      post :service, params: {
        format: :json,
        id: student.id,
        service: service_params
      }
    end

    context 'admin educator logged in' do
      let!(:educator) { FactoryBot.create(:educator, :admin, school: school) }
      let!(:provided_by_educator) { FactoryBot.create(:educator, school: school) }
      let!(:student) { FactoryBot.create(:student, school: school) }

      before do
        sign_in(educator)
      end

      context 'when valid request' do
        let!(:post_params) do
          {
            student_id: student.id,
            service_type_id: 503,
            date_started: '2016-02-22',
            provided_by_educator_id: provided_by_educator.id
          }
        end

        it 'creates a new service' do
          expect { make_post_request(student, post_params) }.to change(Service, :count).by 1
        end

        it 'responds with JSON' do
          make_post_request(student, post_params)
          expect(response.status).to eq 200
          make_post_request(student, post_params)
          expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
          expect(JSON.parse(response.body).keys).to contain_exactly(
            'id',
            'student_id',
            'provided_by_educator_name',
            'recorded_by_educator_id',
            'service_type_id',
            'recorded_at',
            'date_started',
            'discontinued_by_educator_id',
            'discontinued_recorded_at',
            'estimated_end_date'
          )
        end
      end

      context 'when recorded_by_educator_id' do
        it 'ignores the educator_id' do
          make_post_request(student, {
            student_id: student.id,
            service_type_id: 503,
            date_started: '2016-02-22',
            provided_by_educator_id: provided_by_educator.id,
            recorded_by_educator_id: 350
          })
          response_body = JSON.parse(response.body)
          expect(response_body['recorded_by_educator_id']).to eq educator.id
          expect(response_body['recorded_by_educator_id']).not_to eq 350
        end
      end

      context 'when missing params' do
        it 'fails with error messages' do
          make_post_request(student, { text: 'foo' })
          expect(response.status).to eq 422
          response_body = JSON.parse(response.body)
          expect(response_body).to eq({
            "errors" => [
              "Student can't be blank",
              "Service type can't be blank",
              "Date started can't be blank"
            ]
          })
        end
      end
    end
  end

  describe '#latest_iep_document' do
    let!(:pals) { TestPals.create! }

    # eg, for testing send_data_log_subscriber.rb
    def mock_subscribers_log!
      log = LogHelper::RailsLogger.new
      ActiveSupport::Subscriber.subscribers.each do |subscriber|
        allow(subscriber).to receive(:logger).and_return(log)
      end
      log
    end

    def create_iep_student
      FactoryBot.create(:student, {
        first_name: 'Alexander',
        last_name: 'Hamilton',
        local_id: '124046632'
      })
    end

    def create_iep_document(params = {})
      IepDocument.create!({
        student_id: nil,
        file_name: nil,
        file_digest: SecureRandom.hex,
        file_size: 1000 + SecureRandom.random_number(100000),
        s3_filename: SecureRandom.hex
      }.merge(params))
    end

    def get_latest_iep_document_pdf(student_id)
      request.env['HTTPS'] = 'on'
      get :latest_iep_document, params: { id: student_id, format: :pdf }
    end

    it 'works on the happy path' do
      iep_student = create_iep_student
      iep_document = create_iep_document({
        student_id: iep_student.id,
        file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf',
        created_at: '2018-03-04'
      })
      mock_s3 = MockAwsS3::MockedAwsS3.create_with_read_block {|key, bucket| '<pdfbytes>' }
      allow(Aws::S3::Client).to receive(:new).and_return mock_s3

      sign_in(pals.uri)
      get_latest_iep_document_pdf(iep_student.id)
      expect(response.status).to eq 200
      expect(response.body).to eq '<pdfbytes>'
      expect(response.headers['Content-Type']).to eq ('application/pdf')
      expected_filename = "IEP_HamiltonAlexander_20180304_#{iep_student.id}_#{iep_document.id}.pdf"
      expect(response.headers['Content-Disposition']).to eq ("inline; filename=\"#{expected_filename}\"; filename*=UTF-8''#{expected_filename}")
    end

    it 'works to get latest document when there are multiple' do
      iep_student = create_iep_student
      newer_iep_document = create_iep_document({
        student_id: iep_student.id,
        file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf',
        created_at: '2018-03-04'
      })
      older_iep_document = create_iep_document({
        student_id: iep_student.id,
        file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf',
        created_at: '2017-02-24'
      })
      allow(IepStorer).to receive(:unsafe_read_bytes_from_s3).with(anything(), newer_iep_document).and_return '<newbytes>'
      allow(IepStorer).to receive(:unsafe_read_bytes_from_s3).with(anything(), older_iep_document).and_return '<oldbytes>'

      sign_in(pals.uri)
      get_latest_iep_document_pdf(iep_student.id)
      expect(response.status).to eq 200
      expect(response.body).to eq '<newbytes>'
      expect(response.headers['Content-Type']).to eq ('application/pdf')
      expected_filename = "IEP_HamiltonAlexander_20180304_#{iep_student.id}_#{newer_iep_document.id}.pdf"
      expect(response.headers['Content-Disposition']).to eq ("inline; filename=\"#{expected_filename}\"; filename*=UTF-8''#{expected_filename}")
    end

    context 'student has no IEP' do
      it 'returns 404' do
        iep_student = create_iep_student

        sign_in(pals.uri)
        get_latest_iep_document_pdf(iep_student.id)
        expect(response.status).to eq 404
        expect(response.body).to eq 'PDF not found'
      end
    end

    context 'guards authorization' do
      it 'guards access by student' do
        sign_in(pals.shs_jodi)
        get_latest_iep_document_pdf(pals.healey_kindergarten_student.id)
        expect(response.status).to eq 403
        expect(response.body).to eq 'Not authorized'
      end

      it 'guards when not signed in' do
        get_latest_iep_document_pdf(pals.healey_kindergarten_student.id)
        expect(response.status).to eq 401
        expect(response.body).to eq 'You need to sign in before continuing.'
      end
    end

    it 'does not log the student name because of send_data_log_subscriber patch' do
      log = mock_subscribers_log!
      iep_student = create_iep_student
      create_iep_document({
        student_id: iep_student.id,
        file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf',
        created_at: '2018-03-04'
      })
      mock_s3 = MockAwsS3::MockedAwsS3.create_with_read_block {|key, bucket| '<pdfbytes>' }
      allow(Aws::S3::Client).to receive(:new).and_return mock_s3

      sign_in(pals.uri)
      get_latest_iep_document_pdf(iep_student.id)
      expect(response.status).to eq 200
      expect(log.output).to include('Sent data [FILTERED]')
    end
  end
end
