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
      let!(:educator) { FactoryGirl.create(:admin_educator) }
      it 'is successful' do
        make_request('hea')
        expect(response).to be_success
        expect(assigns(:school)).to eq(school)
      end
    end
  end

  describe '#homerooms' do
    before { sign_in(educator) }
    let!(:school) { FactoryGirl.create(:healey) }
    let!(:alpha_homeroom) { FactoryGirl.create(:homeroom, name: 'alpha') }
    let!(:beta_homeroom) { FactoryGirl.create(:homeroom, name: 'beta') }
    let!(:alpha_students) { 3.times {|i| FactoryGirl.create(:student, homeroom: alpha_homeroom, school: school) } }
    let!(:beta_students) { 3.times {|i| FactoryGirl.create(:student, homeroom: beta_homeroom, school: school) } }
    let!(:educator) { FactoryGirl.create(:admin_educator) }

    it 'no exceptions on the happy path' do
      request.env['HTTPS'] = 'on'
      get :homerooms, id: school.slug

      expect(response).to be_success
      expect(assigns(:top_absences).map {|row| row[:name] }).to eq(['beta', 'alpha'])
      expect(assigns(:top_tardies).map {|row| row[:name] }).to eq(['beta', 'alpha'])
      expect(assigns(:top_mcas_math_concerns).map {|row| row[:name] }).to eq(['beta', 'alpha'])
      expect(assigns(:top_mcas_ela_concerns).map {|row| row[:name] }).to eq(['beta', 'alpha'])
    end
  end
end
