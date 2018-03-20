require 'rails_helper'

describe SchoolsController, :type => :controller do
  def extract_serialized_student_ids(controller)
    serialized_data = controller.instance_variable_get(:@serialized_data)
    serialized_data[:students].map {|student_hash| student_hash['id'] }
  end

  before { request.env['HTTPS'] = 'on' }

  describe '#overview' do
    before { School.seed_somerville_schools }
    let!(:districtwide_educator) { FactoryGirl.create(:educator, districtwide_access: true) }

    it 'sets school slug' do
      sign_in(districtwide_educator)
      get :overview, params: { id: 'hea' }

      expect(response).to be_success
      serialized_data = controller.instance_variable_get(:@serialized_data)
      expect(serialized_data[:school_slug]).to eq('hea')
    end
  end

  describe '#overview_json' do
    before { School.seed_somerville_schools }
    let!(:districtwide_educator) { FactoryGirl.create(:educator, districtwide_access: true) }

    it 'is successful' do
      sign_in(districtwide_educator)
      get :overview_json, params: { id: 'hea' }

      expect(response).to be_success
      json = JSON.parse(response.body)
      expect(json.keys).to eq [
        "students",
        "school",
        "current_educator",
        "constant_indexes"
      ]
    end
  end

  describe '#show' do
    context 'districtwide access' do
      before { School.seed_somerville_schools }
      before { FactoryGirl.create(:homeroom) }
      let!(:educator) { FactoryGirl.create(:educator, districtwide_access: true) }

      it 'can access any school in the district' do
        sign_in(educator)
        get :show, params: { id: 'hea' }
        expect(response).to be_success
        get :show, params: { id: 'brn' }
        expect(response).to be_success
        get :show, params: { id: 'kdy' }
        expect(response).to be_success
      end

      before do
        FactoryGirl.create(
          :student,
          :with_service_and_event_note_and_intervention,
          school: School.find_by_local_id('HEA')
        )
      end

      it 'succeeds when students in the school have event notes and services' do
        sign_in(educator)
        get :show, params: { id: 'hea' }
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
        get :show, params: { id: 'hea' }
        expect(response).to be_success
        get :show, params: { id: 'brn' }
        expect(response).not_to be_success
        get :show, params: { id: 'kdy' }
        expect(response).not_to be_success
      end

    end

    context 'educator is not an admin but does have a homeroom' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator_with_homeroom) }
      let!(:homeroom) { educator.homeroom }

      it 'redirects to homeroom page' do
        sign_in(educator)
        get :show, params: { id: 'hea' }
        expect(response).to redirect_to(homeroom_path(homeroom))
      end
    end

    context 'educator is an admin with schoolwide access' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
      let!(:include_me) { FactoryGirl.create(:student, :registered_last_year, school: school) }
      let!(:include_me_too) { FactoryGirl.create(:student, :registered_last_year, school: school) }
      let!(:include_me_not) { FactoryGirl.create(:student, :registered_last_year ) }

      before { school.reload }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        sign_in(educator)
        get :show, params: { id: 'hea' }

        expect(response).to be_success
        student_ids = extract_serialized_student_ids(controller)
        expect(student_ids).to include include_me.id
        expect(student_ids).to include include_me_too.id
        expect(student_ids).not_to include include_me_not
      end
    end

    context 'educator has grade-level access' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator, school: school, grade_level_access: ['4']) }

      let!(:include_me) { FactoryGirl.create(:student, :registered_last_year, grade: '4', school: school) }
      let!(:include_me_too) { FactoryGirl.create(:student, :registered_last_year, grade: '4', school: school) }
      let!(:include_me_not) { FactoryGirl.create(:student, :registered_last_year, grade: '5', school: school) }

      before { school.reload }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        sign_in(educator)
        get :show, params: { id: 'hea' }

        expect(response).to be_success
        student_ids = extract_serialized_student_ids(controller)
        expect(student_ids).to include include_me.id
        expect(student_ids).to include include_me_too.id
        expect(student_ids).not_to include include_me_not
      end
    end

    context 'not logged in' do
      let!(:school) { FactoryGirl.create(:healey) }

      let!(:include_me) { FactoryGirl.create(:student, :registered_last_year, grade: '4', school: school) }

      before { school.reload }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        get :show, params: { id: 'hea' }

        expect(response).to redirect_to(new_educator_session_path)
      end
    end

  end

  describe '#dashboard' do
    def make_request(school_id)
      request.env['HTTPS'] = 'on'
      get :school_administrator_dashboard, params: { id: school_id }
    end

    context 'districtwide access' do
      before { School.seed_somerville_schools }
      let!(:educator) { FactoryGirl.create(:educator, districtwide_access: true, admin: false, school: nil) }

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

    context 'educator has only homeroom access' do
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

  describe '#csv' do
    context 'with school-wide access' do
      before { School.seed_somerville_schools }
      before { FactoryGirl.create(:homeroom) }
      let!(:school) { School.find_by_local_id('HEA') }
      let!(:educator) { FactoryGirl.create(:educator, districtwide_access: true) }

      it 'succeeds without throwing' do
        sign_in(educator)
        get :csv, params: { id: 'hea' }
        expect(response).to be_success
      end
    end
  end
end
