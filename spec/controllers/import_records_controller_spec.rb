require 'rails_helper'

RSpec.describe ImportRecordsController, type: :controller do

  describe '#import_records_json' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :import_records_json, params: {
        format: :json
      }
    end

    it 'guards access if not signed in' do
      make_request
      expect(response.status).to eq 401
    end

    it 'guards access if can_set_districtwide_access:false' do
      educator = FactoryBot.create(:educator, {
        can_set_districtwide_access: false,
        districtwide_access: true,
        admin: true
      })
      sign_in(educator)
      make_request
      expect(response.status).to eq 403
    end

    context 'educator signed in, with can_set_districtwide_access:true even if admin:false' do

      before { sign_in(educator) }

      let(:educator) {
        FactoryBot.create(:educator, {
          can_set_districtwide_access: true,
          districtwide_access: true,
          admin: false
        })
      }

      context 'no import records' do
        it 'can access the page' do
          make_request
          expect(response).to be_successful
          expect(JSON.parse(response.body)).to eq({
            "import_records" => []
          })
        end
      end

      context 'completed import record' do
        let!(:import_record) {
          ImportRecord.create!(
            time_started: Time.now - 4.hours,
            time_ended: Time.now - 2.hours,
            importer_timing_json: "Super useful JSON...",
            task_options_json: "Super useful JSON...",
            log: "Super useful text..."
          )
        }

        it 'can access the page' do
          make_request
          expect(response).to be_successful
          expect(JSON.parse(response.body)["import_records"].size).to eq 1
        end
      end

      context 'import record that did not complete' do
        let!(:import_record) {
          ImportRecord.create!(
            time_started: Time.now - 4.hours,
            importer_timing_json: "Super useful JSON...",
            task_options_json: "Super useful JSON...",
            log: "Super useful text..."
          )
        }

        it 'can access the page' do
          make_request
          expect(response).to be_successful
          expect(JSON.parse(response.body)["import_records"].size).to eq 1
        end
      end
    end
  end
end
