require 'rails_helper'

RSpec.describe ImportRecordsController, type: :controller do

  describe '#import_records_json' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :import_records_json
    end

    context 'educator signed in' do

      before { sign_in(educator) }

      context 'educator w districtwide access' do
        let(:educator) {
          FactoryBot.create(:educator, districtwide_access: true, admin: true)
        }

        context 'no import records' do
          it 'can access the page' do
            make_request
            expect(response).to be_successful
            expect(JSON.parse(response.body)).to eq({
              "import_records" => [],
              "queued_jobs" => [],
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
            expect(JSON.parse(response.body)["queued_jobs"].size).to eq 0
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
            expect(JSON.parse(response.body)["queued_jobs"].size).to eq 0
          end
        end

        context 'educator w/o districtwide access' do
          let(:educator) { FactoryBot.create(:educator) }
          it 'cannot access the page; gets redirected' do
            make_request
            expect(JSON.parse(response.body)).to eq({ "error" => "You don't have the correct authorization." })
          end
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
