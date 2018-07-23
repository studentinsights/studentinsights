require 'rails_helper'

describe SchoolsController, :type => :controller do
  def extract_serialized_student_ids(controller)
    serialized_data = controller.instance_variable_get(:@serialized_data)
    serialized_data[:students].map {|student_hash| student_hash['id'] }
  end

  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }

  describe '#overview' do
    let!(:districtwide_educator) { FactoryBot.create(:educator, districtwide_access: true) }

    it 'sets school slug' do
      sign_in(districtwide_educator)
      get :overview, params: { id: 'hea' }

      expect(response).to be_successful
      serialized_data = controller.instance_variable_get(:@serialized_data)
      expect(serialized_data[:school_slug]).to eq('hea')
    end
  end

  describe '#overview_json' do
    let!(:districtwide_educator) { FactoryBot.create(:educator, districtwide_access: true) }

    it 'is successful' do
      sign_in(districtwide_educator)
      get :overview_json, params: { id: 'hea' }

      expect(response).to be_successful
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
      before { FactoryBot.create(:homeroom) }
      let!(:educator) { FactoryBot.create(:educator, districtwide_access: true) }

      it 'can access any school in the district' do
        sign_in(educator)
        get :show, params: { id: 'hea' }
        expect(response).to be_successful
        get :show, params: { id: 'brn' }
        expect(response).to be_successful
        get :show, params: { id: 'kdy' }
        expect(response).to be_successful
      end

      before do
        FactoryBot.create(
          :student,
          :with_service_and_event_note_and_intervention,
          school: School.find_by_local_id('HEA')
        )
      end

      it 'succeeds when students in the school have event notes and services' do
        sign_in(educator)
        get :show, params: { id: 'hea' }
        expect(response).to be_successful
      end

    end

    context 'schoolwide access but no districtwide access' do
      before { FactoryBot.create(:homeroom) }
      let(:hea) { School.find_by_local_id 'HEA' }
      let!(:educator) {
        FactoryBot.create(:educator, schoolwide_access: true, school: hea)
      }

      it 'can only access assigned school' do
        sign_in(educator)
        get :show, params: { id: 'hea' }
        expect(response).to be_successful
        get :show, params: { id: 'brn' }
        expect(response).not_to be_successful
        get :show, params: { id: 'kdy' }
        expect(response).not_to be_successful
      end

    end

    context 'educator is not an admin but does have a homeroom' do
      let!(:school) { FactoryBot.create(:healey) }
      let!(:educator) { FactoryBot.create(:educator_with_homeroom) }
      let!(:homeroom) { educator.homeroom }

      it 'redirects' do
        sign_in(educator)
        get :show, params: { id: 'hea' }
        expect(response).to redirect_to(home_path)
      end
    end

    context 'educator is an admin with schoolwide access' do
      let!(:school) { FactoryBot.create(:healey) }
      let!(:educator) { FactoryBot.create(:educator, :admin, school: school) }
      let!(:include_me) { FactoryBot.create(:student, :registered_last_year, school: school) }
      let!(:include_me_too) { FactoryBot.create(:student, :registered_last_year, school: school) }
      let!(:include_me_not) { FactoryBot.create(:student, :registered_last_year ) }

      before { school.reload }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        sign_in(educator)
        get :show, params: { id: 'hea' }

        expect(response).to be_successful
        student_ids = extract_serialized_student_ids(controller)
        expect(student_ids).to include include_me.id
        expect(student_ids).to include include_me_too.id
        expect(student_ids).not_to include include_me_not
      end
    end

    context 'educator has grade-level access' do
      let!(:school) { FactoryBot.create(:healey) }
      let!(:educator) { FactoryBot.create(:educator, school: school, grade_level_access: ['4']) }

      let!(:include_me) { FactoryBot.create(:student, :registered_last_year, grade: '4', school: school) }
      let!(:include_me_too) { FactoryBot.create(:student, :registered_last_year, grade: '4', school: school) }
      let!(:include_me_not) { FactoryBot.create(:student, :registered_last_year, grade: '5', school: school) }

      before { school.reload }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        sign_in(educator)
        get :show, params: { id: 'hea' }

        expect(response).to be_successful
        student_ids = extract_serialized_student_ids(controller)
        expect(student_ids).to include include_me.id
        expect(student_ids).to include include_me_too.id
        expect(student_ids).not_to include include_me_not
      end
    end

    context 'not logged in' do
      let!(:school) { FactoryBot.create(:healey) }

      let!(:include_me) { FactoryBot.create(:student, :registered_last_year, grade: '4', school: school) }

      before { school.reload }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        get :show, params: { id: 'hea' }

        expect(response).to redirect_to(new_educator_session_path)
      end
    end

  end

  describe '#absence_dashboard_data' do
    def make_request(school_id)
      get :absence_dashboard_data, params: { id: school_id }
    end

    let!(:pals) { TestPals.create! }

    context 'districtwide access' do
      it 'can access any school in the district' do
        sign_in(pals.uri)
        School.all.each do |school|
          make_request(school.slug)
          expect(response).to be_successful
        end
      end
    end

    context 'schoolwide access but no districtwide access' do
      it 'can only access assigned school' do
        sign_in(pals.healey_laura_principal)
        make_request('hea')
        expect(response).to be_successful
        (School.all - [School.find_by_slug('hea')]).each do |school|
          make_request(school.slug)
          expect(response).not_to be_successful
        end
      end
    end

    context 'other new_educator_session_path' do
      it 'redirects' do
        authorized_educators = [pals.uri, pals.rich_districtwide, pals.healey_laura_principal]
        (Educator.all - authorized_educators).each do |educator|
          sign_in(educator)
          make_request('hea')
          expect(response).to redirect_to(home_path)
        end
      end
    end
  end

  describe '#tardies_dashboard_data' do
    let!(:pals) { TestPals.create! }

    def make_request(educator, school_slug)
      sign_in(educator)
      get :tardies_dashboard_data, params: { id: school_slug }
      response
    end

    it 'works on happy path' do
      expect(make_request(pals.uri, pals.healey.slug)).to be_successful
    end

    it 'enforces authorization' do
      authorized_educators = [pals.uri, pals.rich_districtwide, pals.healey_laura_principal]
      (Educator.all - authorized_educators).each do |educator|
        expect(make_request(educator, pals.healey.slug)).to redirect_to(home_path)
      end
    end
  end

  describe '#discipline_dashboard_data' do
    let!(:pals) { TestPals.create! }

    def make_request(educator, school_slug)
      sign_in(educator)
      get :discipline_dashboard_data, params: { id: school_slug }
      response
    end

    it 'works on happy path' do
      expect(make_request(pals.uri, pals.healey.slug)).to be_successful
    end

    it 'enforces authorization' do
      authorized_educators = [pals.uri, pals.rich_districtwide, pals.healey_laura_principal]
      (Educator.all - authorized_educators).each do |educator|
        expect(make_request(educator, pals.healey.slug)).to redirect_to(home_path)
      end
    end
  end

  describe '#csv' do
    context 'with school-wide access' do
      before { FactoryBot.create(:homeroom) }
      let!(:school) { School.find_by_local_id('HEA') }
      let!(:educator) { FactoryBot.create(:educator, districtwide_access: true) }

      it 'succeeds without throwing' do
        sign_in(educator)
        get :csv, params: { id: 'hea' }
        expect(response).to be_successful
      end
    end
  end

  describe '#courses_json' do
    def make_request(school_id)
      get :courses_json, params: { format: :json, id: school_id }
    end

    it 'guards authorization unless districtwide' do
      sign_in(pals.healey_laura_principal)
      make_request('hea')
      expect(response.status).to eq 403
    end

    it 'is successful and returns the right shape' do
      sign_in(pals.uri)
      make_request('shs')
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to eq(['courses', 'school'])
      expect(json['courses'].size).to eq(3)
      expect(json['courses'].first.keys).to eq(['id', 'course_number', 'course_description', 'sections'])
    end
  end
end
