require 'rails_helper'

describe Admin::EducatorsController do
  def make_request
    request.env['HTTPS'] = 'on'
    get :index
  end

  describe '#index' do

    context 'not logged in' do
      it 'fails' do
        make_request
        expect(response.status).to eq 302
      end
    end

    context 'not admin' do
      let(:educator) { FactoryGirl.create(:educator) }
      it 'fails' do
        sign_in(educator)
        make_request
        expect(response.status).to eq 302
      end
    end

    context 'admin' do
      let(:educator) { FactoryGirl.create(:educator, :admin) }
      it 'succeeds' do
        sign_in(educator)
        make_request
        expect(response.status).to eq 200
      end
    end

  end

end
