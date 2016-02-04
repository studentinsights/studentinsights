require 'rails_helper'

RSpec.describe SchoolStudentPresenter do
  let(:student) { FactoryGirl.create(:student, :with_risk_level) }

  subject(:presenter) { SchoolStudentPresenter.new(student) }

  before { FactoryGirl.create(:student_school_year, student: student) }

  describe '#as_json' do
    context 'no events or student attributes' do
      it 'includes nil student attributes' do
        expect(presenter.as_json).to include({
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
        expect(presenter.as_json[:student_risk_level]).not_to be_nil
      end
      it 'returns an empty array of interventions' do
        expect(presenter.as_json[:interventions]).to eq []
      end
      it 'returns a discipline incident count of zero' do
        expect(presenter.as_json[:discipline_incidents_count]).to eq 0
      end
    end

    context 'with interventions' do
      let!(:student) { FactoryGirl.create(:student_with_one_atp_intervention) }
      it 'returns 1 intervention' do
        expect(presenter.as_json[:interventions].size).to eq 1
      end
      it 'returns correct intervention data' do
        expect(presenter.as_json[:interventions][0].as_json).to include({
          "student_id"=>student.id,
          "number_of_hours"=>10,
        })
      end
    end
  end
end
