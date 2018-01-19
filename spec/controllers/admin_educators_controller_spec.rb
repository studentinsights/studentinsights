require 'rails_helper'

describe Admin::EducatorsController do
  let!(:pals) { TestPals.create! }

  describe '#index' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :index
    end

    context 'not logged in' do
      it 'fails' do
        make_request
        expect(response.status).to eq 302
      end
    end

    context 'not admin' do
      let(:educator) { pals.healey_sarah_teacher }
      it 'fails' do
        sign_in(educator)
        make_request
        expect(response.status).to eq 302
      end
    end

    context 'admin' do
      let(:educator) { pals.uri }
      it 'succeeds' do
        sign_in(educator)
        make_request
        expect(response.status).to eq 200
      end
    end
  end

  describe '#update' do
    let(:admin) { pals.uri }

    def make_request(params)
      request.env['HTTPS'] = 'on'
      post :update, params: params
    end

    context 'educator data with grade level access data' do
      let(:educator) { FactoryGirl.create(:educator) }

      let(:params) {
        {
          "educator" => {
            "grade_level_access" => {
              "1" => "on", "2" => "on"
            },
            "schoolwide_access"=>"1",
            "restricted_to_sped_students"=>"0",
            "restricted_to_english_language_learners"=>"0",
            "can_view_restricted_notes"=>"0"
          },
          "id" => educator.id
        }
      }

      it 'succeeds' do
        sign_in(admin)
        make_request(params)
        educator.reload
        expect(educator.schoolwide_access).to eq(true)
        expect(educator.grade_level_access).to match_array(["1", "2"])
      end
    end

    context 'educator data no grade level access data' do
      let(:educator) { FactoryGirl.create(:educator) }

      let(:params) {
        {
          "educator" => {
            "schoolwide_access"=>"1",
            "restricted_to_sped_students"=>"0",
            "restricted_to_english_language_learners"=>"0",
            "can_view_restricted_notes"=>"0"
          },
          "id" => educator.id
        }
      }

      it 'succeeds' do
        sign_in(admin)
        make_request(params)
        educator.reload
        expect(educator.schoolwide_access).to eq(true)
        expect(educator.grade_level_access).to eq([])
      end
    end
  end

  describe '#authorization' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :authorization
    end

    context 'not logged in' do
      it 'fails' do
        make_request
        expect(response.status).to eq 302
      end
    end

    context 'teacher' do
      let(:educator) { pals.healey_sarah_teacher }
      it 'fails' do
        sign_in(educator)
        make_request
        expect(response.status).to eq 302
      end
    end

    context 'can set access' do
      let(:educator) { pals.uri }
      it 'succeeds' do
        sign_in(educator)
        make_request
        expect(response.status).to eq 200
      end
    end
  end
end
