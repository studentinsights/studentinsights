require 'rails_helper'

describe SchoolsController, :type => :controller do

  describe '#show' do
    def make_request(school_id)
      request.env['HTTPS'] = 'on'
      get :show, id: school_id
    end

    before { sign_in(educator) }
    let!(:school) { FactoryGirl.create(:healey) }

    context 'educator is not an admin' do
      let!(:educator) { FactoryGirl.create(:educator) }
      it 'redirects to sign in page' do
        make_request('hea')
        expect(response).to redirect_to(new_educator_session_path)
      end
    end

    context 'educator is an admin' do
      let!(:educator) { FactoryGirl.create(:educator, :admin) }
      it 'is successful' do
        make_request('hea')
        expect(response).to be_success
        expect(assigns(:serialized_data)).to include :students, :intervention_types
      end
    end
  end

end
