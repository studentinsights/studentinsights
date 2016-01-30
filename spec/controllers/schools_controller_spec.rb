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

  describe '#fat_student_hash' do
    let!(:student) { FactoryGirl.create(:student, :with_risk_level) }
    before { FactoryGirl.create(:student_school_year, student: student) }
    let!(:student_hash) { controller.send(:fat_student_hash, student) }

    context 'no events or student attributes' do
      it 'includes nil student attributes' do
        expect(student_hash).to include({
         "disability" => nil,
         "first_name" => nil,
         "free_reduced_lunch" => nil,
         "grade" => nil,
         "hispanic_latino" => nil,
         "home_language" => nil,
         "last_name" => nil,
         "limited_english_proficiency" => nil,
         "most_recent_mcas_ela_growth" => nil,
         "most_recent_mcas_ela_performance" => nil,
         "most_recent_mcas_ela_scaled" => nil,
         "most_recent_mcas_math_growth" => nil,
         "most_recent_mcas_math_performance" => nil,
         "most_recent_mcas_math_scaled" => nil,
         "most_recent_star_math_percentile" => nil,
         "most_recent_star_reading_percentile" => nil,
         "plan_504" => nil,
         "program_assigned" => nil,
         "race" => nil,
         "registration_date" => nil,
         "school_id" => nil,
         "sped_level_of_need" => nil,
         "sped_placement" => nil,
         "state_id" => nil,
         "student_address" => nil,
        })
      end
      it 'returns student_risk_level' do
        expect(student_hash[:student_risk_level]).not_to be_nil
      end
      it 'returns an empty array of interventions' do
        expect(student_hash[:interventions]).to eq []
      end
      it 'returns a discipline incident count of zero' do
        expect(student_hash[:discipline_incidents_count]).to eq 0
      end
    end

    context 'with interventions' do
      let!(:student) { FactoryGirl.create(:student_with_one_atp_intervention) }
      it 'returns 1 intervention' do
        expect(student_hash[:interventions].size).to eq 1
      end
      it 'returns correct intervention data' do
        expect(student_hash[:interventions][0].as_json).to include({
          "student_id"=>student.id,
          "number_of_hours"=>10,
        })
      end
    end
  end
end
