require 'rails_helper'

describe SchoolsController, :type => :controller do

  describe '#show' do
    def make_request(school_id)
      request.env['HTTPS'] = 'on'
      get :show, id: school_id
    end

    # Read the instance variable and pull out the ids of students
    def extract_serialized_student_ids(controller)
      serialized_data = controller.instance_variable_get(:@serialized_data)
      serialized_data[:students].map {|student_hash| student_hash[:id] }
    end

    context 'districtwide access' do
      before { School.seed_somerville_schools }
      before { FactoryGirl.create(:homeroom) }
      let!(:educator) { FactoryGirl.create(:educator, districtwide_access: true) }

      it 'can access any school in the district' do
        sign_in(educator)
        make_request('hea')
        expect(response).to be_success
        make_request('brn')
        expect(response).to be_success
        make_request('kdy')
        expect(response).to be_success
      end

    end

    context 'schoolwide access but no districtwide access' do
      before { School.seed_somerville_schools }
      before { FactoryGirl.create(:homeroom) }
      let(:hea) { School.find_by_local_id 'HEA' }
      let!(:educator) {
        FactoryGirl.create(:educator, schoolwide_access: true, school: hea)
      }

      it 'can only access assigned school' do
        sign_in(educator)
        make_request('hea')
        expect(response).to be_success
        make_request('brn')
        expect(response).not_to be_success
        make_request('kdy')
        expect(response).not_to be_success
      end

    end

    context 'educator is not an admin but does have a homeroom' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator_with_homeroom) }
      let!(:homeroom) { educator.homeroom }

      it 'redirects to homeroom page' do
        sign_in(educator)
        make_request('hea')

        expect(response).to redirect_to(homeroom_path(homeroom))
      end
    end

  end

end
