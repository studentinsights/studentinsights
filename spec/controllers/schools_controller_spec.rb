require 'rails_helper'

describe SchoolsController, :type => :controller do

  describe '#students' do

    def make_request(school_id)
      request.env['HTTPS'] = 'on'
      get :students, id: school_id
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
        expect(assigns(:school)).to eq(school)
      end
    end
  end

  describe '#homerooms' do

    before do
      sign_in(educator)
    end

    let!(:school) { FactoryGirl.create(:healey) }
    let!(:educator) { FactoryGirl.create(:educator, :admin) }
    let!(:alpha_homeroom) { FactoryGirl.create(:homeroom, name: 'alpha') }
    let!(:beta_homeroom) { FactoryGirl.create(:homeroom, name: 'beta') }

    context 'students have no attendance events or student assessment results' do

      let!(:school_year) { FactoryGirl.create(:school_year) }

      let!(:alpha_students) {
        3.times do |i|
          student = FactoryGirl.create(:student, homeroom: alpha_homeroom, school: school)
          FactoryGirl.create(:student_school_year, student: student, school_year: school_year)
        end
      }

      let!(:beta_students) {
        3.times do |i|
          student = FactoryGirl.create(:student, homeroom: beta_homeroom, school: school)
          FactoryGirl.create(:student_school_year, student: student, school_year: school_year)
        end
      }

      it 'shows top attendance events homerooms but no top MCAS concern homerooms' do
        Student.update_attendance_events_counts_most_recent_school_year
        Student.update_recent_student_assessments
        request.env['HTTPS'] = 'on'
        get :homerooms, id: school.slug

        expect(response).to be_success
        expect(assigns(:top_absences).map {|row| row[:name] }).to eq(['beta', 'alpha'])
        expect(assigns(:top_tardies).map {|row| row[:name] }).to eq(['beta', 'alpha'])
      end
    end

    context 'students have MCAS ELA and Math assessment results' do

      let!(:school_year) { FactoryGirl.create(:sy_2013_2014) }

      let!(:alpha_students) {
        3.times do |i|
          student = FactoryGirl.create(:student, :with_mcas_math_score_240, :with_mcas_ela_score_250, homeroom: alpha_homeroom, school: school)
          FactoryGirl.create(:student_school_year, student: student, school_year: school_year)
        end
      }

      let!(:beta_students) {
        3.times do |i|
          student = FactoryGirl.create(:student, :with_mcas_math_score_240, :with_mcas_ela_score_250, homeroom: beta_homeroom, school: school)
          FactoryGirl.create(:student_school_year, student: student, school_year: school_year)
        end
      }

      it 'shows top attendance events homerooms and top MCAS concern homerooms' do
        Student.update_attendance_events_counts_most_recent_school_year
        Student.update_recent_student_assessments
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
end
