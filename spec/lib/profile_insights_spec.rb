require 'spec_helper'

RSpec.describe ProfileInsights do
  describe '#as_json' do
    let!(:school) { FactoryBot.create(:school) }
    let!(:student) { FactoryBot.create(:student, school: school) }
    let!(:educator) { FactoryBot.create(:educator, :admin, school: school, full_name: "Teacher, Karen") }

    describe 'on happy path' do
      let!(:transition_note_text) do
        "What are this student's strengths?\neverything!\n\nWhat is this student's involvement in the school community like?\nreally good\n\nHow does this student relate to their peers?\nnot sure\n\nWho is the student's primary guardian?\nokay\n\nAny additional comments or good things to know about this student?\nnope :)"
      end
      let!(:transition_note) { FactoryBot.create(:transition_note, student: student, text: transition_note_text) }
      let!(:survey) { FactoryBot.create(:student_voice_completed_survey, student: student) }

      it 'works' do
        expect(ProfileInsights.new(student).as_json.size).to eq 6
      end
    end

    describe 'with survey responses that have empty text' do
      let!(:survey) do
        FactoryBot.create(:student_voice_completed_survey, {
          student: student,
          proud: '',
          best_qualities: '',
          activities_and_interests: '',
          nervous_or_stressed: '',
          learn_best: 'When I am motivated and in a good mood'
        })
      end

      it 'excludes survey responses that are empty text' do
        expect(ProfileInsights.new(student).as_json.size).to eq 1
      end
    end

    describe 'with teams' do
      let!(:pals) { TestPals.create!(skip_imported_forms: true) }

      it 'includes teams for test time' do
        expect(ProfileInsights.new(pals.shs_freshman_mari).as_json.size).to eq 1
        expect(ProfileInsights.new(pals.shs_freshman_mari).as_json).to eq [{
          'type'=>'about_team_membership',
          'json'=>{
            "activity_text"=>"Competitive Cheerleading Varsity",
            "coach_text"=>"Fatima Teacher",
            "season_key"=>"winter",
            "school_year_text"=>"2017-18",
            "active"=>false
          }
        }]
      end
    end

    describe 'with winter student voice survey insights' do
      let!(:pals) { TestPals.create!(skip_team_memberships: true) }

      it 'does not include Q2 self reflection by default' do
        insights_json = ProfileInsights.new(pals.shs_freshman_mari).as_json
        expect(insights_json.size).to eq 6
        expect(insights_json.map {|i| i['type'] }.uniq).to eq ['from_generic_imported_form']
        expect(insights_json.map {|i| i['json']['form_key'] }.uniq).to eq ['shs_what_i_want_my_teacher_to_know_mid_year']
      end

      it 'can include Q2 self reflection' do
        mock_per_district = PerDistrict.new
        allow(mock_per_district).to receive(:include_q2_self_reflection_insights?).and_return(true)
        allow(PerDistrict).to receive(:new).and_return(mock_per_district)

        insights_json = ProfileInsights.new(pals.shs_freshman_mari).as_json
        expect(insights_json.size).to eq 14
        expect(insights_json.map {|i| i['type'] }.uniq).to eq ['from_generic_imported_form']
        expect(insights_json.map {|i| i['json']['form_key'] }.uniq).to contain_exactly(*[
          'shs_what_i_want_my_teacher_to_know_mid_year',
          'shs_q2_self_reflection'
        ])
        expect(insights_json).to include({
          "type"=>"from_generic_imported_form",
          "json"=> {
            "form_key" => "shs_q2_self_reflection",
            "prompt_text"=> "At the end of the quarter 3, what would make you most proud of your accomplishments in your course?",
            "response_text"=> "Keeping grades high in all classes since I'm worried about college",
            "flattened_form_json" => anything()
          }
        }) # one example, testing shape
      end
    end

    describe 'from_bedford_transition' do
      let!(:pals) { TestPals.create!(skip_team_memberships: true) }

      it 'returns expected shape' do
        mock_per_district = PerDistrict.new
        allow(mock_per_district).to receive(:include_bedford_end_of_year_transition?).and_return(true)
        allow(PerDistrict).to receive(:new).and_return(mock_per_district)

        insights_json = ProfileInsights.new(pals.healey_kindergarten_student).as_json
        expect(insights_json.size).to eq 1
        expect(insights_json.first).to eq({
          'type' => 'from_bedford_transition',
          'json' => {
            "insight_text"=>"Garfield enjoyed sharing special time reading together for a few minutes at the end of the day.",
            "form_url"=>"https://example.com/form_url",
            "educator"=>{
              "id"=>pals.healey_vivian_teacher.id,
              "email"=>"vivian@demo.studentinsights.org",
              "full_name"=>"Teacher, Vivian"
            }
          }
        })
      end
    end
  end
end
