require 'rails_helper'

describe IsServiceWorkingController, :type => :controller do

  describe '#is_service_working_json' do
    let!(:pals) { TestPals.create! }

    def make_request(service_type_id)
      request.env['HTTPS'] = 'on'
      get :is_service_working_json, params: {
        format: :json, service_type_id: service_type_id
      }
    end

    context 'districtwide educator logged in' do
      let!(:student_with_attendance_officer) { FactoryBot.create(:student) }
      let!(:attendance_officer_service) {
        FactoryBot.create(:service,
          student: student_with_attendance_officer,
          service_type_id: 502,
          date_started: Time.now - 2.days,
          discontinued_at: nil,
        )
      }

      let!(:student_with_old_attendance_officer) { FactoryBot.create(:student) }
      let!(:old_attendance_officer_service) {
        FactoryBot.create(:service,
          student: student_with_old_attendance_officer,
          service_type_id: 502,
          date_started: Time.now - 3.years,
          discontinued_at: nil,
        )
      }

      let!(:student_with_attendance_contract) { FactoryBot.create(:student) }
      let!(:attendance_contract_service) {
        FactoryBot.create(:service,
          student: student_with_attendance_contract,
          service_type_id: 503,
          date_started: Time.now - 2.days,
          discontinued_at: nil,
        )
      }

      it 'succeeds and sends down the right data as JSON' do
        sign_in(pals.uri)
        make_request(502)
        expect(response).to be_successful
        expect(JSON.parse(response.body)).to eq({'chart_data' => []})
      end
    end

    context 'classroom teacher logged in' do
      it 'does not succeed' do
        sign_in(pals.shs_bill_nye)
        make_request(502)
        expect(response).not_to be_successful
        expect(JSON.parse(response.body)).to eq({
          'error' => 'unauthorized'
        })
      end
    end

    context 'educator not logged in' do
      it 'does not succeed' do
        make_request(502)
        expect(response).not_to be_successful
        expect(JSON.parse(response.body)).to eq({
          'error' => 'You need to sign in before continuing.'
        })
      end
    end
  end

end
