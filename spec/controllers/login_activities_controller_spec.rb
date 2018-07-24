require 'rails_helper'

RSpec.describe LoginActivitiesController, type: :controller do
  describe '#index_json' do
    let!(:pals) { TestPals.create! }

    def make_request(created_at_or_before:, created_after:)
      request.env['HTTPS'] = 'on'
      get :index_json, params: {
        format: :json,
        created_at_or_before: created_at_or_before,
        created_after: created_after
      }
    end

    let(:july_2018_start_in_seconds) { DateTime.new(2018, 7, 1).to_i.to_s }
    let(:july_2018_end_in_seconds) { DateTime.new(2018, 7, 31).to_i.to_s }

    context 'districtwide educator logged in' do
      let!(:success_login_activity) {
        LoginActivity.create!({
          identity: 'rich@demo.studentinsights.org',
          success: true,
          created_at: DateTime.new(2018, 7, 10)
        })
      }

      let!(:unsuccessful_login_activity) {
        LoginActivity.create!({
          identity: 'spammy@demo.studentinsights.org',
          success: false,
          created_at: DateTime.new(2018, 7, 20),
          failure_reason: 'invalid'
        })
      }

      it 'succeeds and sends down the right data as JSON' do
        sign_in(pals.uri)
        make_request(created_at_or_before: july_2018_end_in_seconds, created_after: july_2018_start_in_seconds)
        expect(response).to be_successful
        expect(JSON.parse(response.body)).to match_array([
          {
            "identity"=>"rich@demo.studentinsights.org",
            "success"=>true,
            "created_at"=>"2018-07-10T00:00:00.000Z",
            "failure_reason"=>nil
          },
          {
            "identity"=>"spammy@demo.studentinsights.org",
            "success"=>false,
            "created_at"=>"2018-07-20T00:00:00.000Z",
            "failure_reason"=>'invalid'
          }
        ])
      end
    end

    context 'classroom teacher logged in' do
      it 'does not succeed' do
        sign_in(pals.shs_bill_nye)
        make_request(created_at_or_before: july_2018_end_in_seconds, created_after: july_2018_start_in_seconds)
        expect(response).not_to be_successful
        expect(JSON.parse(response.body)).to eq({
          'error' => 'unauthorized'
        })
      end
    end

    context 'educator not logged in' do
      it 'does not succeed' do
        make_request(created_at_or_before: july_2018_end_in_seconds, created_after: july_2018_start_in_seconds)
        expect(response).not_to be_successful
        expect(JSON.parse(response.body)).to eq({
          'error' => 'You need to sign in before continuing.'
        })
      end
    end
  end
end
