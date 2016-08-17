require 'rails_helper'

describe StudentDecorator do

  let(:student_without_attributes) { FactoryGirl.create(:student).decorate}
  let(:student_with_full_name) { FactoryGirl.create(:student_with_full_name).decorate }
  let(:sped_student) { FactoryGirl.create(:sped_student).decorate }

  describe '#full_name' do
    context 'has a first and last name' do
      it 'presents the full name' do
        expect(student_with_full_name.full_name).to eq student_with_full_name.first_name + " " + student_with_full_name.last_name
      end
    end
  end
  describe '#sped' do
    context 'belongs to Sped Program' do
      it 'presents the program assigned' do
        expect(sped_student.program_assigned).to eq "Sp Ed"
      end
    end
    context 'does not have a program assigned' do
      it 'presents N/A' do
        expect(student_without_attributes.sped_placement).to eq "—"
      end
    end
  end


  describe '#as_json_for_school_overview' do
    before {
      student.student_school_years.first.present? || StudentSchoolYear.create!(
        student: student, school_year: SchoolYear.first_or_create!
      )
    }

    context 'no events or student attributes' do
      let(:student) { FactoryGirl.create(:student, :with_risk_level).decorate }

      it 'includes nil student attributes' do
        expect(student.as_json_for_school_overview).to include({
         "disability" => nil,
         "first_name" => nil,
         "free_reduced_lunch" => nil,
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
         "school_id" => student.school.id,
         "sped_level_of_need" => nil,
         "sped_placement" => nil,
         "state_id" => nil,
         "student_address" => nil,
        })
      end
      it 'returns student_risk_level' do
        expect(student.as_json_for_school_overview[:student_risk_level]).not_to be_nil
      end
      it 'returns an empty array of interventions' do
        expect(student.as_json_for_school_overview[:interventions]).to eq []
      end
      it 'returns a discipline incident count of zero' do
        expect(student.as_json_for_school_overview[:discipline_incidents_count]).to eq 0
      end
    end

    context 'with interventions' do
      let!(:student) { FactoryGirl.create(:student_with_one_atp_intervention).decorate }
      it 'returns 1 intervention' do
        expect(student.as_json_for_school_overview[:interventions].size).to eq 1
      end
      it 'returns correct intervention data' do
        expect(student.as_json_for_school_overview[:interventions][0].as_json).to include({
          "student_id"=>student.id,
          "number_of_hours"=>10,
        })
      end
    end
  end

end
