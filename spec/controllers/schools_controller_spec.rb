require 'rails_helper'

describe SchoolsController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }

  def get_overview_json(id, options = {})
    sign_in(options[:educator]) if options.has_key?(:educator)
    request.env['HTTP_ACCEPT'] = 'application/json'
    get :overview_json, params: { id: id }
    response
  end

  def extract_serialized_student_ids(response)
    json = JSON.parse(response.body)
    json['students'].map {|student_hash| student_hash['id'] }
  end

  let!(:pals) { TestPals.create! }

  describe '#overview_json' do
    let!(:districtwide_educator) { FactoryBot.create(:educator, districtwide_access: true) }

    it 'is successful' do
      response = get_overview_json('hea', educator: districtwide_educator)
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to contain_exactly(*[
        "students",
        "school",
        "district_key",
        "current_educator",
        "constant_indexes"
      ])
    end
  end

  describe '#overview_json combinations' do
    context 'districtwide access' do
      before { FactoryBot.create(:homeroom) }
      let!(:educator) { FactoryBot.create(:educator, districtwide_access: true) }

      it 'can access any school in the district' do
        expect(get_overview_json('hea', educator: educator).status).to eq 200
        expect(get_overview_json('brn', educator: educator).status).to eq 200
        expect(get_overview_json('kdy', educator: educator).status).to eq 200
      end

      before do
        FactoryBot.create(
          :student,
          :with_service_and_event_note_and_intervention,
          school: School.find_by_local_id('HEA')
        )
      end

      it 'succeeds when students in the school have event notes and services' do
        get_overview_json('hea', educator: educator)
        expect(response.status).to eq 200
      end

    end

    context 'schoolwide access but no districtwide access' do
      before { FactoryBot.create(:homeroom) }
      let(:hea) { School.find_by_local_id 'HEA' }
      let!(:educator) {
        FactoryBot.create(:educator, schoolwide_access: true, school: hea)
      }

      it 'can only access assigned school' do
        expect(get_overview_json('hea', educator: educator).status).to eq 200
        expect(get_overview_json('brn', educator: educator).status).to eq 403
        expect(get_overview_json('kdy', educator: educator).status).to eq 403
      end

    end

    context 'educator is not an admin but does have a homeroom' do
      let!(:school) { pals.healey }
      let!(:educator) { FactoryBot.create(:educator_with_homeroom) }
      let!(:homeroom) { educator.homeroom }

      it 'guards access' do
        expect(get_overview_json('hea', educator: educator).status).to eq 403
      end
    end

    context 'educator is an admin with schoolwide access' do
      let!(:school) { pals.healey }
      let!(:educator) { FactoryBot.create(:educator, schoolwide_access: true, school: school) }
      let!(:include_me) { FactoryBot.create(:student, :registered_last_year, school: school) }
      let!(:include_me_too) { FactoryBot.create(:student, :registered_last_year, school: school) }
      let!(:include_me_not) { FactoryBot.create(:student, :registered_last_year ) }

      it 'is successful and returns the correct students' do
        response = get_overview_json('hea', educator: educator)
        expect(response.status).to eq 200
        student_ids = extract_serialized_student_ids(response)
        expect(student_ids).to include include_me.id
        expect(student_ids).to include include_me_too.id
        expect(student_ids).not_to include include_me_not
      end
    end

    context 'educator has grade-level access' do
      let!(:school) { pals.healey }
      let!(:educator) { FactoryBot.create(:educator, school: school, grade_level_access: ['4']) }

      let!(:include_me) { FactoryBot.create(:student, :registered_last_year, grade: '4', school: school) }
      let!(:include_me_too) { FactoryBot.create(:student, :registered_last_year, grade: '4', school: school) }
      let!(:include_me_not) { FactoryBot.create(:student, :registered_last_year, grade: '5', school: school) }

      it 'is successful and returns the correct students' do
        response = get_overview_json('hea', educator: educator)

        expect(response.status).to eq 200
        student_ids = extract_serialized_student_ids(response)
        expect(student_ids).to include include_me.id
        expect(student_ids).to include include_me_too.id
        expect(student_ids).not_to include include_me_not
      end
    end

    context 'not logged in' do
      let!(:school) { pals.healey }

      let!(:include_me) { FactoryBot.create(:student, :registered_last_year, grade: '4', school: school) }

      it 'guards access' do
        get_overview_json('hea')
        expect(response.status).to eq 401
      end
    end

  end

  describe '#absence_dashboard_data' do
    def make_request(school_id)
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :absence_dashboard_data, params: { id: school_id }
    end

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
          expect(response.status).to eq 403
        end
      end
    end
  end

  describe '#tardies_dashboard_data' do
    let!(:pals) { TestPals.create! }

    def make_request(educator, school_slug)
      request.env['HTTP_ACCEPT'] = 'application/json'
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
        expect(make_request(educator, pals.healey.slug).status).to eq 403
      end
    end
  end

  describe '#discipline_dashboard_data' do
    let!(:pals) { TestPals.create! }

    def make_request(educator, school_slug)
      request.env['HTTP_ACCEPT'] = 'application/json'
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
        expect(make_request(educator, pals.healey.slug).status).to eq 403
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
      request.env['HTTP_ACCEPT'] = 'application/json'
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
