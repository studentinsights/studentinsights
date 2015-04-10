require 'rails_helper'

describe StudentsController, :type => :controller do

  describe '#index' do

    context 'when educator is not logged in' do

      it 'redirects to sign in page' do

        get :index
        expect(response).to redirect_to(new_educator_session_path)
        expect(response).to have_http_status(302)

      end

    end

    context 'when educator is logged in' do

      it 'allows access to index page' do

        educator = FactoryGirl.create(:educator)
        sign_in educator
        get :index
        expect(response).to be_success
        expect(response).to have_http_status(200)

      end

    end

  end

end