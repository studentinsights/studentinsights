require 'rails_helper'

RSpec.describe ImportRecordsController, type: :controller do

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
end
