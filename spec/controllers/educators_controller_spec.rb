require 'rails_helper'

describe EducatorsController, :type => :controller do

  describe '#homepage' do

    def make_request
      request.env['HTTPS'] = 'on'
      get :homepage
    end

    before { sign_in(educator) }

    context 'non admin' do

      context 'with homeroom' do
        let!(:educator) { FactoryGirl.create(:educator_with_grade_5_homeroom) }
        it 'redirects to default homeroom' do
          make_request
          expect(response).to redirect_to(homeroom_url(educator.homeroom))
        end
      end

      context 'without homeroom' do
        let!(:educator) { FactoryGirl.create(:educator) }
        let!(:homeroom) { FactoryGirl.create(:homeroom) }   # Not associated with educator
        it 'redirects to no homeroom assigned page' do
          make_request
          expect(response).to redirect_to(no_homeroom_url)
        end
      end
    end

    context 'admin' do
      let(:educator) { FactoryGirl.create(:educator, :admin) }

      context 'school exists' do
        let!(:school) { FactoryGirl.create(:school) }
        it 'redirects to first school overview page' do
          make_request
          expect(response).to redirect_to(school_url(School.first))
        end
      end

      context 'no schools exist' do
        it 'throws an error' do
          expect { make_request }.to raise_error ActionController::UrlGenerationError
        end
      end

    end
  end

  describe '#reset_session_clock' do
    def make_request
      request.env['HTTPS'] = 'on'
      request.env["devise.mapping"] = Devise.mappings[:educator]
      get :reset_session_clock, format: :json
    end

    context 'educator is not logged in' do
      it 'returns 401 Unauthorized' do
        make_request
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'educator is logged in' do
      before(:each) do
        sign_in FactoryGirl.create(:educator)
        make_request
      end
      it 'succeeds' do
        expect(response).to have_http_status(:success)
      end
      it 'resets the session clock' do
        # TODO: Get Devise test helpers like `educator_session`
        # working within the Rspec controller context:
        # expect(educator_session["last_request_at"]).eq Time.now
      end
    end

  end
end
