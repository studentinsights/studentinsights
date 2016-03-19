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

    context 'educator is an admin with schoolwide access' do
      let!(:school) { FactoryGirl.create(:healey) }
      let!(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
      let!(:include_me) { FactoryGirl.create(:student, :registered_last_year, school: school) }
      let!(:include_me_too) { FactoryGirl.create(:student, :registered_last_year, school: school) }
      let!(:include_me_not) { FactoryGirl.create(:student, :registered_last_year ) }

      before { school.reload }
      before { Student.update_student_school_years }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        sign_in(educator)
        make_request('hea')

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
      before { Student.update_student_school_years }

      let(:serialized_data) { assigns(:serialized_data) }

      it 'is successful and assigns the correct students' do
        sign_in(educator)
        make_request('hea')

        expect(response).to be_success
        student_ids = extract_serialized_student_ids(controller)
        expect(student_ids).to include include_me.id
        expect(student_ids).to include include_me_too.id
        expect(student_ids).not_to include include_me_not
      end
    end

  end

end
